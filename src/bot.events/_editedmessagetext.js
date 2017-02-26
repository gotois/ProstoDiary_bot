const sessions = require('./../sessions');
const bot = require('./../bot.config.js');
const dbEntries = require('./../database/database.entries.js');
const crypt = require('./../crypt');
const format = require('./../format');
/***
 * текст редактируется он обновляет свое значение в БД.
 * @param msg {Object}
 * @return {void}
 */
function onEditedMessageText(msg) {
  const chatId = msg.chat.id;
  const fromId = msg.from.id;
  const input = msg.text.trim();
  if (input.startsWith('/')) {
    bot.sendMessage(chatId, 'Редактирование этой записи невозможно');
    return;
  }
  const currentUser = sessions.getSession(fromId);
  if (input === 'del') {
    dbEntries.delete(currentUser.id, msg.message_id).then(() => {
      return bot.sendMessage(chatId, 'Запись удалена');
    }).catch(error => {
      console.error(error);
      return bot.sendMessage(chatId, error.toLocaleString());
    });
    return;
  }
  dbEntries.put(currentUser.id, crypt.encode(input), new Date(), msg.message_id).then(() => {
    return bot.sendMessage(chatId, format.prevInput(input) + 'Запись обновлена');
  }).catch(error => {
    console.error(error);
    return bot.sendMessage(chatId, error.toLocaleString());
  });
}

module.exports = onEditedMessageText;
