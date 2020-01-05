const uuidv1 = require('uuid/v1');
const bot = require('../../core/bot');
const { pool } = require('../../core/database');
const storyQueries = require('../../db/story');
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
      const rows = await pool.connect(async (connection) => {
        const result = await connection.many(
          storyQueries.selectCategories(intentName)
        );
        return result;
      });

      // todo ссылки на ассистента должны браться из БД
      // бот отправляет ассистенту необработанные табличные данные JSON rows посредством HTTP POST
      const searchURL = IS_PRODUCTION ?
        'https://us-central1-prostodiary.cloudfunctions.net/xxx' :
        'http://localhost:5000/prostodiary/us-central1/xxx';
      try {
        switch (actionName) {
          // для графика
          case 'graph': {
            const photo = await requestService.post(searchURL, {
              data: rows,
              action: actionName,
            }, {
              'content-type': 'image/png'
            }, null);
            await bot.sendPhoto(this.message.chat.id, Buffer.from(photo), {
              caption: dialogResultInner.fulfillmentText,
            }, {
              filename: 'graph',
              contentType: 'image/png',
            });
            break;
          }
          default: {
            // todo показать текстом с пагинацией
            // todo задать вопрос насчет сортировки asc/desc
            await this.showMessageByOne();
            break;
          }
        }
      } catch (error) {
        logger.error(error);
        await bot.sendMessage(this.message.chat.id, `Ассистент ${intentName} недоступен`);
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
    await bot.sendMessage(
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
