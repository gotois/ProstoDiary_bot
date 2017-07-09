const sessions = require('../services/session.service');
const bot = require('./../config/bot.config');
const datetime = require('../services/date.service');
const dbEntries = require('../database/bot.database');
const crypt = require('../services/crypt.service');
const commands = require('../commands/bot.commands');
const format = require('../services/format.service');
/***
 * Установить что я делал в какой-то день:
 * /set 26.11.2016 something text
 * @param msg {Object}
 * @param msg.chat {Object}
 * @param msg.text {String}
 * @param msg.from {Object}
 * @param msg.message_id {Number}
 * @param match {Array}
 * @return {void}
 */
function setDataFromDate({chat, text, from, message_id}, match) {
  const chatId = chat.id;
  const input = text.replace(commands.SETDATE, '').trim();
  const date = datetime.convertToNormalDate(match[1]);
  if (!datetime.isNormalDate(date)) {
    bot.sendMessage(chatId, 'Установленное время не валидно');
    return;
  }
  const currentUser = sessions.getSession(from.id);
  dbEntries.post(currentUser.id, crypt.encode(input), message_id, new Date(), match[1]).then(() => {
    const text = format.prevInput(input);
    return bot.sendMessage(chatId, text);
  }).catch(error => {
    console.error(error);
    return bot.sendMessage(chatId, 'Произошла ошибка');
  });
}

module.exports = setDataFromDate;
