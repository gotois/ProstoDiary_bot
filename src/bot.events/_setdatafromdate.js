const sessions = require('./../sessions');
const bot = require('./../config/bot.config.js');
const datetime = require('./../datetime');
const dbEntries = require('./../database/database.entries.js');
const crypt = require('./../crypt');
const commands = require('./../bot.commands.js');
const format = require('./../format');
/***
 * Установить что я делал в какой-то день:
 * /set 26.11.2016 something text
 * @param msg {Object}
 * @param match {Array}
 * @return {void}
 */
function setDataFromDate(msg, match) {
  const chatId = msg.chat.id;
  const input = msg.text.replace(commands.SETDATE, '').trim();
  const date = datetime.convertToNormalDate(match[1]);
  if (!datetime.isNormalDate(date)) {
    bot.sendMessage(chatId, 'Установленное время не валидно');
    return;
  }
  const currentUser = sessions.getSession(msg.from.id);
  dbEntries.post(currentUser.id, crypt.encode(input), msg.message_id, new Date(), match[1]).then(() => {
    const text = format.prevInput(input);
    return bot.sendMessage(chatId, text);
  }).catch(error => {
    console.error(error);
    return bot.sendMessage(chatId, 'Произошла ошибка');
  });
}

module.exports = setDataFromDate;
