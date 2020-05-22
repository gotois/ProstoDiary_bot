const { v1: uuidv1 } = require('uuid');
const { pool } = require('../../../db/sql');
const storyQueries = require('../../../db/selectors/story');
const { allCommands } = require('../commands');
const logger = require('../../../lib/log');
const requestService = require('../../../services/request.service');
const dialogService = require('../../../services/dialog.service');
const TelegramBotRequest = require('./telegram-bot-request');
const TelegramMessage = require('../models/telegram-bot-message');
const { IS_PRODUCTION } = require('../../../environment');

// todo поддержать Jena
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
      .replace(allCommands.SEARCH.alias, '')
      .trim()
      .toLowerCase();
    super(message);

    this.uuid = uuidv1();
  }
  async showResult(dialogResultInner) {
    logger.info('dialogResultInner', dialogResultInner);
    let category;
    // пример: 'health', 'graph'
    const [
      intentName,
      actionName,
    ] = dialogResultInner.action.toLowerCase().split('.');

    if (intentName) {
      category = intentName;
    } else {
      category = dialogResultInner.intent.displayName.toLowerCase();
    }
    category = category.replace(/action$/i, '');

    // todo лучше переделать на jsonld
    // todo валидировать параметры (dialogResult.parameters) и на основе них формировать лучшую выборку
    const rows = await pool.connect(async (connection) => {
      const result = await connection.many(
        storyQueries.selectCategories(category),
      );
      return result;
    });
    // todo ссылки на ассистента должны браться из БД по oidc client_id
    // бот отправляет ассистенту необработанные табличные данные JSON rows посредством HTTP POST
    const searchURL = IS_PRODUCTION
      ? 'https://us-central1-prostodiary.cloudfunctions.net/xxx'
      : 'http://localhost:5000/prostodiary/us-central1/xxx';
    try {
      switch (actionName) {
        // для графика
        case 'graph': {
          const photo = await requestService.post(
            searchURL,
            {
              data: rows,
              action: actionName,
            },
            {
              'content-type': 'image/png',
            },
            null,
          );
          await this.bot.sendPhoto(
            this.message.chat.id,
            Buffer.from(photo),
            {
              caption: dialogResultInner.fulfillmentText,
            },
            {
              filename: 'graph',
              contentType: 'image/png',
            },
          );
          break;
        }
        default: {
          const text = await requestService.post(
            searchURL,
            {
              data: rows,
              action: 'table',
            },
            {
              // 'content-type': 'image/png' // todo использовать plain text или markdown для таблиц
            },
            null,
          );
          // todo показать текстом с пагинацией
          // todo задать вопрос насчет сортировки asc/desc
          // ...
          await this.bot.sendMessage(
            this.message.chat.id,
            JSON.stringify(text, null, 2),
            {
              disable_web_page_preview: true,
              parse_mode: 'Markdown',
              // reply_markup: replyMarkup,
            },
          );
          // await this.showMessageByOne();
          break;
        }
      }
    } catch (error) {
      logger.error(error.stack);
      await this.bot.sendMessage(
        this.message.chat.id,
        `Assistant ${intentName} unavailable`,
      );
    }
  }
  async beginDialog(silent) {
    await super.beginDialog(silent);
    logger.info(`Поиск ${this.message.text}`);

    const dialogResult = await dialogService.search(
      this.message.text,
      this.uuid,
    );
    if (
      dialogResult.intent.displayName === 'Unknown' ||
      !dialogResult.outputContexts
    ) {
      logger.warn('undefined intent: ' + dialogResult.queryText);
      await this.bot.sendMessage(
        this.message.chat.id,
        dialogResult.fulfillmentText,
      );
      return;
    }

    // start todo это в рекурсивную функцию
    if (
      dialogResult.diagnosticInfo &&
      dialogResult.diagnosticInfo.fields.end_conversation
    ) {
      await this.showResult(dialogResult);
    } else {
      const { message_id } = await this.bot.sendMessage(
        this.message.chat.id,
        dialogResult.fulfillmentText,
        {
          reply_markup: {
            force_reply: true,
          },
        },
      );
      this.bot.onReplyToMessage(
        this.message.chat.id,
        message_id,
        async ({ text }) => {
          const dialogResultInner = await dialogService.search(text, this.uuid);
          await this.showResult(dialogResultInner);
        },
      );
    }
    // end
  }
  // @deprecated
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
    await this.bot.sendMessage(this.message.chat.id, generatorResult.value, {
      disable_web_page_preview: true,
      parse_mode: 'Markdown',
      reply_markup: replyMarkup,
    });
  }
}
/**
 * @param {TelegramMessage} message - message
 * @returns {Promise<undefined>}
 */
module.exports = async (message) => {
  const search = new Search(message);
  await search.beginDialog();
};
