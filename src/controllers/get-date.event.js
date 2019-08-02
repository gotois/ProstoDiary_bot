const bot = require('../core');
const sessions = require('../services/session.service');
const logger = require('../services/logger.service');
/**
 * Получить все что я делал в эту дату
 *
 * /get 26.11.2016 or /get today
 *
 * @param {object} msg - message
 * @param {object} msg.chat - chat
 * @param {object} msg.from - from
 * @param {Array} match - matcher
 * @returns {undefined}
 */
const getDataFromDate = async ({ chat, from }, match) => {
  logger.log('info', getDataFromDate.name);
  const chatId = chat.id;
  const userId = from.id;
  const currentUser = sessions.getSession(userId);
  const getDateAPI = require('../api/v1/get-date');
  try {
    const rows = await getDateAPI(match, currentUser);
    if (rows.length === 0) {
      await bot.sendMessage(chatId, 'Записей нет');
      return;
    }
    for (const row of rows) {
      await bot.forwardMessage(chatId, userId, row.telegram_message_id);
    }
  } catch (error) {
    logger.log('error', error.toString());
    await bot.sendMessage(chatId, error.message || 'Произошла ошибка');
  }
};

module.exports = getDataFromDate;
