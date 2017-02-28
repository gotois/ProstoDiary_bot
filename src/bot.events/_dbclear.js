const dbEntries = require('./../database/database.entries.js');
const sessions = require('./../sessions');
const bot = require('./../config/bot.config.js');
/***
 * Очистить базу данных с подтверждением
 * @param msg {Object}
 * @return {void}
 */
function onDBCLEAR(msg) {
  const chatId = msg.chat.id;
  const fromId = msg.from.id;
  const options = {
    reply_markup: {
      'force_reply': true
    }
  };
  const currentUser = sessions.getSession(fromId);
  bot.sendMessage(chatId, 'Очистить ваши записи? (Y/N)', options).then(sended => {
    const senderId = sended.chat.id;
    const messageId = sended.message_id;

    return bot.onReplyToMessage(senderId, messageId, message => {
      if (message.text.toUpperCase() === 'Y') {
        return dbEntries.clear(currentUser.id).then(() => {
          return bot.sendMessage(senderId, 'Данные очищены');
        }).catch(error => {
          console.error(error);
          return bot.sendMessage(senderId, 'Ошибка в операции');
        });
      } else {
        return bot.sendMessage(senderId, 'Операция не выполнена');
      }
    });
  });
}

module.exports = onDBCLEAR;
