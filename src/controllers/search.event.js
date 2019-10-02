const bot = require('../core/bot');
const commands = require('../core/commands');
const logger = require('../services/logger.service');
const searchAPI = require('../api/v2/search');
const TelegramBotRequest = require('./telegram-bot-request');

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
  constructor(message, api) {
    message.text = message.text
      .replace(commands.SEARCH.alias, '')
      .trim()
      .toLowerCase();
    super(message, api);
  }
  async showMessage(generator) {
    const generatorResult = generator.next();
    if (generatorResult.done || !generatorResult.value) {
      return;
    }
    const messageListener = async (query) => {
      bot.off('callback_query', messageListener);
      switch (query.data) {
        case Search.enum.NEXT_PAGE: {
          await bot.deleteMessage(
            this.message.chat.id,
            this.botMessage.message_id,
          );
          await this.showMessage(generator);
          break;
        }
        default: {
          break;
        }
      }
    };
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
    this.botMessage = await bot.sendMessage(
      this.message.chat.id,
      generatorResult.value,
      {
        disable_web_page_preview: true,
        parse_mode: 'Markdown',
        reply_markup: replyMarkup,
      },
    );
    bot.once('callback_query', messageListener);
  }
}
/**
 * @param {TelegramMessage} message - message
 * @returns {Promise<undefined>}
 */
const onSearch = async (message) => {
  logger.log('info', onSearch.name);
  const search = new Search(message, searchAPI);
  const searchResult = await search.request();
  // todo использовать этот контроллер для понимания что отображать пользователю - если есть возможность отобразить график - отображать и прочее
  if (searchResult.graph) {
    await bot.sendPhoto(
      message.chat.id,
      searchResult.graph.buffer,
      searchResult.graph.options,
    );
  }
  await search.showMessage(searchResult.generator);
};

module.exports = onSearch;
