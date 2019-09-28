const bot = require('../core/bot');
const logger = require('../services/logger.service');
/**
 * /set 2016-12-29 something text
 *
 * @param {object} msg - message
 * @param {object} msg.chat - chat
 * @param {string} msg.text - text
 * @param {object} msg.from - from
 * @param {number} msg.message_id - id message
 * @param {Array} match - match
 * @returns {undefined}
 */
const setDataFromDate = async ({ chat, text, from, message_id }, match) => {
  logger.log('info', setDataFromDate.name);
  const chatId = chat.id;
  const setDateAPI = require('../api/v1/set-date');
  try {
    const setDateResult = await setDateAPI(text, message_id, match, from.id);
    await bot.sendMessage(chatId, setDateResult);
  } catch (error) {
    logger.error(error);
    await bot.sendMessage(chatId, error.message);
  }
};

module.exports = setDataFromDate;
