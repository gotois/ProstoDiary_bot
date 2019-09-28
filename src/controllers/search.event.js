const bot = require('../core/bot');
const logger = require('../services/logger.service');
/**
 * @todo использовать этот контроллер для понимания что отображать пользователю
 * @param {object} msg - message
 * @param {object} msg.chat - chat
 * @param {object} msg.from - from
 * @param {Array} match - match
 * @returns {undefined}
 */
const onSearch = async ({ chat, from }, match) => {
  logger.log('info', onSearch.name);
  const chatId = chat.id;
  const fromId = from.id;
  const searchAPI = require('../api/v1/search');
  try {
    await searchAPI(match, fromId, async (result, form, endCallback) => {
      await bot.sendMessage(chatId, result, form);
      if (endCallback) {
        bot.once('callback_query', endCallback);
      }
    });
  } catch (error) {
    logger.error(error);
    await bot.sendMessage(chatId, error.message);
  }
};

module.exports = onSearch;
