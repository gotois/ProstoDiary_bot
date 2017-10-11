const sessions = require('../services/session.service');
const bot = require('./../config/bot.config');
const datetime = require('../services/date.service');
const dbEntries = require('../database/bot.database');
const crypt = require('../services/crypt.service');
/***
 * Получить все что я делал в эту дату
 * @example /get 26.11.2016
 * @param msg {Object}
 * @param msg.chat {Object}
 * @param msg.from {Object}
 * @param match {Array}
 * @return {void}
 */
const getDataFromDate = async ({chat,from}, match) => {
  const chatId = chat.id;
  const userId = from.id;
  const getTime = match[1].trim();
  try {
    const date = datetime.convertToNormalDate(getTime);
    if (!datetime.isNormalDate(date)) {
      throw new Error('Wrong date');
    }
  } catch (error) {
    await bot.sendMessage(chatId, 'Установленное время не валидно');
    return;
  }
  const currentUser = sessions.getSession(userId);
  try {
    const {rows} = await dbEntries.get(currentUser.id, getTime);
    const decodeRows = rows.map(({entry}) => crypt.decode(entry));
    await (decodeRows.length)
      ? (bot.sendMessage(chatId, JSON.stringify(decodeRows, null, 2)))
      : (bot.sendMessage(chatId, 'Записей нет'));
  } catch (error) {
    console.error(error);
    await bot.sendMessage(chatId, 'Произошла ошибка');
  }
};

module.exports = getDataFromDate;
