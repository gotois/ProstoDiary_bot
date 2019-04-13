const bot = require('../bot');
const sessions = require('../services/session.service');
const datetime = require('../services/date.service');
const dbEntries = require('../database/database.entities');
const crypt = require('../services/crypt.service');
const logger = require('../services/logger.service');
/**
 * Получить все что я делал в эту дату
 *
 * @example /get 26.11.2016 or /get today
 * @param {Object} msg - message
 * @param {Object} msg.chat - chat
 * @param {Object} msg.from - from
 * @param {Array} match - matcher
 * @returns {undefined}
 */
const getDataFromDate = async ({ chat, from }, match) => {
  logger.log('info', getDataFromDate.name);
  const chatId = chat.id;
  const userId = from.id;

  let getTime;
  let date;

  if (match[0] === '/get today') {
    getTime = new Date();
  } else if (match[0] === '/get week') {
    // TODO: https://github.com/gotois/ProstoDiary_bot/issues/54
    // Который отдаёт все за прошлую неделю
  } else {
    getTime = match[1].trim();
  }

  try {
    date = datetime.convertToNormalDate(getTime);
    if (!datetime.isNormalDate(date)) {
      throw new Error('Wrong date');
    }
  } catch (error) {
    logger.log('error', error.toString());
    await bot.sendMessage(chatId, 'Установленное время не валидно');

    return;
  }
  const currentUser = sessions.getSession(userId);
  try {
    const { rows } = await dbEntries.get(currentUser.id, date);
    const decodeRows = rows.map(({ entry }) => {
      return crypt.decode(entry);
    });
    decodeRows.length
      ? await bot.sendMessage(chatId, JSON.stringify(decodeRows, null, 2))
      : await bot.sendMessage(chatId, 'Записей нет');
  } catch (error) {
    logger.log('error', error.toString());
    await bot.sendMessage(chatId, 'Произошла ошибка');
  }
};

module.exports = getDataFromDate;
