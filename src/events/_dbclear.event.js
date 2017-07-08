const dbEntries = require('../database/bot.database');
const sessions = require('../services/sessions');
const bot = require('./../config/bot.config');
/***
 * Очистить базу данных с подтверждением
 * @param msg {Object}
 * @param msg.chat {Object}
 * @param msg.from {Object}
 * @return {void}
 */
function onDBCLEAR({chat, from}) {
  const chatId = chat.id;
  const fromId = from.id;
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
