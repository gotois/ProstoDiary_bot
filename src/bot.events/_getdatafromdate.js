const sessions = require('./../sessions');
const bot = require('./../bot.config.js');
const datetime = require('./../datetime');
const dbEntries = require('./../database/database.entries.js');
const crypt = require('./../crypt');
/***
 * Получить все что я делал в эту дату
 * @example /get 26.11.2016
 * @param msg {Object}
 * @param match {Array}
 * @return {void}
 */
function getDataFromDate(msg, match) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const date = datetime.convertToNormalDate(match[1]);
  if (!datetime.isNormalDate(date)) {
    bot.sendMessage(chatId, 'Установленное время не валидно');
    return;
  }
  const currentUser = sessions.getSession(userId);
  dbEntries.get(currentUser.id, match[1]).then(data => {
    const rows = data.rows.map(row => crypt.decode(row.entry));
    if (rows.length) {
      bot.sendMessage(chatId, JSON.stringify(rows, null, 2));
    } else {
      bot.sendMessage(chatId, 'Записей нет');
    }
  }).catch(error => {
    console.error(error);
    bot.sendMessage(chatId, 'Произошла ошибка');
  });
}

module.exports = getDataFromDate;
