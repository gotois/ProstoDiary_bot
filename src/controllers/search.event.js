const bot = require('../core/bot');
const commands = require('../core/commands');
const logger = require('../services/logger.service');
const searchAPI = require('../api/v2/search');
const countAPI = require('../api/v1/count');
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
  {
    //  прежняя регулярка  alias: /^\/get (\d{4}-\d{1,2}-\d{1,2})$/, - 'Получение данных за этот срок `YYYY-MM-DD`',
    // ...
    // расширить до '/search yesterday'/ '/search позавчера' и т.д.
    // ...
    // todo пример получения данных. Бывший "/get 26.11.2016 or /get today"
    // const rows = await getDateAPI(match, userId);
    // if (rows.length === 0) {
    //   await bot.sendMessage(chatId, 'Записей нет');
    //   return;
    // }
    // for (const row of rows) {
    //   await bot.forwardMessage(chatId, userId, row.telegram_message_id);
    // }
  }
  {
    // todo пример  сколько всего потрачено|получено (прежний /count)
    // const countResult = await countAPI(match[1].toUpperCase(), fromId);
    // const replyParameters = Object.assign({}, parameters, {
    //   reply_markup: {
    //     inline_keyboard: [
    //       [
    //         { text: 'Всего потрачено', callback_data: '-' },
    //         { text: 'Всего получено', callback_data: '+' },
    //       ],
    //     ],
    //   },
    // });
    // await bot.sendMessage(chatId, 'Финансы', replyParameters);
    // TODO: возможна утечка, если не уничтожать слушатель
    // bot.once('callback_query', async ({ data }) => {
    //   const countResult = await countAPI(data, fromId);
    //   await bot.sendMessage(chatId, countResult, parameters);
    // });
  }
  // todo если результат имеет информацию о еде, тогда подключать соответствующего ассистента по еде и предлагать советы
  // ...

  await search.showMessage(searchResult.generator);
};

module.exports = onSearch;
