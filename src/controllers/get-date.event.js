const bot = require('../bot');
const sessions = require('../services/session.service');
const datetime = require('../services/date.service');
const dbEntries = require('../database/entities.database');
const crypt = require('../services/crypt.service');
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

  let getTime;
  let date;

  if (match[0] === '/get today') {
    getTime = new Date();
  } else if (match[0] === '/get week') {
    // TODO: https://github.com/gotois/ProstoDiary_bot/issues/54
    // Который отдаёт все за прошлую неделю
  } else if (match[0] === '/get month') {
    // ...
  } else if (match[0] === '/get year') {
    // ...
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
    const rows = await dbEntries.get(currentUser.id, date);
    const decodeRows = rows.map(({ entry }) => {
      return crypt.decode(entry);
    });
    decodeRows.length > 0
      ? await bot.sendMessage(chatId, JSON.stringify(decodeRows, null, 2))
      : await bot.sendMessage(chatId, 'Записей нет');
    // todo: https://github.com/gotois/ProstoDiary_bot/issues/109
    // надо получать из значений только то что является едой и это передавать в foodService
    // ...
  } catch (error) {
    logger.log('error', error.toString());
    await bot.sendMessage(chatId, 'Произошла ошибка');
  }
};

module.exports = getDataFromDate;
