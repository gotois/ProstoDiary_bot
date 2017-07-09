const sessions = require('../services/session.service');
const bot = require('./../config/bot.config');
const dbEntries = require('../database/bot.database');
const crypt = require('../services/crypt.service');
const format = require('../services/format.service');
/***
 * текст редактируется он обновляет свое значение в БД.
 * @param msg {Object}
 * @param msg.chat {Object}
 * @param msg.from {Object}
 * @param msg.text {String}
 * @param msg.message_id {String}
 * @return {void}
 */
function onEditedMessageText({chat, from, text, message_id}) {
  const chatId = chat.id;
  const fromId = from.id;
  const input = text.trim();
  if (input.startsWith('/')) {
    bot.sendMessage(chatId, 'Редактирование этой записи невозможно');
    return;
  }
  const currentUser = sessions.getSession(fromId);
  if (input === 'del') {
    dbEntries.delete(currentUser.id, message_id).then(() => {
      return bot.sendMessage(chatId, 'Запись удалена');
    }).catch(error => {
      console.error(error);
      return bot.sendMessage(chatId, error.toLocaleString());
    });
    return;
  }
  dbEntries.put(currentUser.id, crypt.encode(input), new Date(), message_id).then(() => {
    return bot.sendMessage(chatId, format.prevInput(input) + 'Запись обновлена');
  }).catch(error => {
    console.error(error);
    return bot.sendMessage(chatId, error.toLocaleString());
  });
}

module.exports = onEditedMessageText;
