const uuidv1 = require('uuid/v1');
const bot = require('../../core/bot');
const { pool, sql } = require('../../core/database');
const { telegram } = require('../../controllers');
const logger = require('../../services/logger.service');
const requestService = require('../../services/request.service');
const dialogService = require('../../services/dialog.service');
const TelegramBotRequest = require('./telegram-bot-request');
const { IS_PRODUCTION } = require('../../environment');

class Search extends TelegramBotRequest {
  /**
   * @constant
   * @type {object}
   */
  static get enum() {
    return {
      NEXT_PAGE: '__next_page',
    };
  }
  constructor(message) {
    message.text = message.text
      .replace(telegram.SEARCH.alias, '')
      .trim()
      .toLowerCase();
    super(message);

    this.uuid = uuidv1();
    this.messageListener = this.messageListener.bind(this);
    bot.on('callback_query', this.messageListener);
  }

  async beginDialog() {
    await super.beginDialog();
    logger.info(`Поиск ${this.message.text}`);

    const dialogResult = await dialogService.search(this.message.text, this.uuid);
    if (dialogResult.intent.displayName === 'Unknown' || !dialogResult.outputContexts) {
      logger.warn('undefined intent: ' + dialogResult.queryText);
      await bot.sendMessage(this.message.chat.id, dialogResult.fulfillmentText);
      return;
    }

    const { message_id } = await bot.sendMessage(this.message.chat.id, dialogResult.fulfillmentText, {
      reply_markup: {
        force_reply: true,
      }
    });

    bot.onReplyToMessage(this.message.chat.id, message_id, async ({ text }) => {
      const dialogResultInner = await dialogService.search(text, this.uuid);
      // пример: 'health', 'graph'
      const [intentName, actionName] = dialogResultInner.action.toLowerCase().split('.');

      // todo валидировать параметры (dialogResult.parameters) и на основе них формировать лучшую выборку
      // берем максимум позволительных данных из открытого БД
      const rows = await pool.connect(async (connection) => {
        const result = await connection.many(sql`
    select * from story where
    '{${sql.identifier([intentName])}}' <@ categories
    `);// todo add :  `AND created_at between '2019-12-15' AND '2019-12-15'`
        return result;
      });

      // todo ссылки на ассистента должны браться из БД
      // бот отправляет ассистенту необработанные табличные данные JSON rows посредством HTTP POST
      const searchURL = IS_PRODUCTION ?
        'https://us-central1-prostodiary.cloudfunctions.net/xxx' :
        'http://localhost:5000/prostodiary/us-central1/xxx';
      const photo = await requestService.post(searchURL, {
        data: rows,
        action: actionName,
      }, {
        'content-type': 'image/png'
      }, null);

      // todo нужен switch по action
      if (photo) {
        // для графика
        await bot.sendPhoto(this.message.chat.id, Buffer.from(photo), {
          caption: dialogResultInner.fulfillmentText,
        }, {
          filename: 'graph',
          contentType: 'image/png',
        });
      }
    });
  }
  async showMessageByOne() {
    const generatorResult = this._searchGenerator.next();
    if (generatorResult.done || !generatorResult.value) {
      return;
    }
    let replyMarkup;
    if (generatorResult.done) {
      replyMarkup = null;
    } else {
      replyMarkup = {
        inline_keyboard: [
          [{ text: 'NEXT', callback_data: Search.enum.NEXT_PAGE }],
        ],
      };
    }
    // fixme: форвардить сообщения, если они есть
    //  if (false) {
    //  await bot.forwardMessage(chatId, userId, row.telegram_message_id);
    //  } else
    {
      this.botMessage = await bot.sendMessage(
        this.message.chat.id,
        generatorResult.value,
        {
          disable_web_page_preview: true,
          parse_mode: 'Markdown',
          reply_markup: replyMarkup,
        },
      );
    }
  }
  // todo поддержать, сейчас не используется
  async messageListener({ data }) {
    switch (data) {
      case Search.enum.NEXT_PAGE: {
        await bot.deleteMessage(
          this.message.chat.id,
          this.botMessage.message_id,
        );
        await this.showMessageByOne();
        break;
      }
      // Показ всех записей сортировка ASC
      case 'ASC': {
        const searchResult = await this.request('search', {});

        if (searchResult.generator) {
          this._searchGenerator = searchResult.generator;
          await this.showMessageByOne();
        }
        break;
      }
      // Показ всех записей сортировка DESC
      case 'DESC': {
        const searchResult = await this.request('search', {});
        break;
      }
      // детальный поиск через follow-up intent
      case 'DETAIL': {
        const botMessageMore = await bot.sendMessage(
          this.message.chat.id,
          'Детальный поиск [SEARCH]',
          {
            reply_markup: {
              force_reply: true,
            },
          },
        );
        bot.onReplyToMessage(
          this.message.chat.id,
          botMessageMore.message_id,
          async ({ text }) => {
            const dialogResult = await dialogService.search(text);
            logger.log(':::', dialogResult);
            await bot.sendMessage(
              this.message.chat.id,
              dialogResult.fulfillmentText,
            );
          },
        );
        break;
      }
      default: {
        bot.off('callback_query', this.messageListener);
        break;
      }
    }
  }
}
/**
 * @param {TelegramMessage} message - message
 * @returns {Promise<undefined>}
 */
module.exports = async (message) => {
  if (!message.passport.activated) {
    throw new Error('Bot not activated');
  }
  const search = new Search(message);
  await search.beginDialog();
};
