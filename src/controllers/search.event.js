const bot = require('../core/bot');
const commands = require('../core/commands');
const logger = require('../services/logger.service');
const searchAPI = require('../api/v2/search');
/**
 * @constant
 * @type {string}
 */
const NEXT_PAGE = '__next_page';
/**
 * @todo использовать этот контроллер для понимания что отображать пользователю
 * @param {object} msg - message
 * @param {object} msg.chat - chat
 * @param {object} msg.from - from
 * @param {string} msg.text - text
 * @returns {undefined}
 */
const onSearch = async ({ chat, from, text }) => {
  let botMessage;
  async function showMessage() {
    const generatorResult = result.generator.next();
    if (result.generator.done || !result.generator.value) {
      return;
    }
    botMessage = await bot.sendMessage(chatId, generatorResult.value, {
      disable_web_page_preview: true,
      parse_mode: 'Markdown',
      reply_markup: generatorResult.done
        ? null
        : { inline_keyboard: [[{ text: 'NEXT', callback_data: NEXT_PAGE }]] },
    });
    bot.once('callback_query', messageListener);
  }
  async function messageListener(query) {
    bot.off('callback_query', messageListener);
    switch (query.data) {
      case NEXT_PAGE: {
        await bot.deleteMessage(chatId, botMessage.message_id);
        await showMessage();
        break;
      }
      default: {
        break;
      }
    }
  }
  logger.log('info', onSearch.name);
  const chatId = chat.id;
  const fromId = from.id;
  const input = text
    .replace(commands.SEARCH.alias, '')
    .trim()
    .toLowerCase();

  // todo: нужно разбирать input в том числе через dialogflow (через создание возможности dialogflow context?)
  // ...
  // еще подключить /balance | /count | /get-date

  const { error, result } = await searchAPI(input, fromId);
  if (error) {
    logger.error(error);
    await bot.sendMessage(chatId, error.message);
    return;
  }
  await bot.sendPhoto(chatId, result.graph.buffer, result.graph.options);
  await showMessage();
};

module.exports = onSearch;
