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
function getDataFromDate({chat,from}, match) {
  const chatId = chat.id;
  const userId = from.id;
  const date = datetime.convertToNormalDate(match[1]);
  if (!datetime.isNormalDate(date)) {
    bot.sendMessage(chatId, 'Установленное время не валидно');
    return;
  }
  const currentUser = sessions.getSession(userId);
  dbEntries.get(currentUser.id, match[1]).then(data => {
    const rows = data.rows.map(({entry}) => crypt.decode(entry));
    if (rows.length) {
      return bot.sendMessage(chatId, JSON.stringify(rows, null, 2));
    } else {
      return bot.sendMessage(chatId, 'Записей нет');
    }
  }).catch(error => {
    console.error(error);
    return bot.sendMessage(chatId, 'Произошла ошибка');
  });
}

module.exports = getDataFromDate;
