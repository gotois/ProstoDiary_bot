const dbEntries = require('./../database.entries.js');
const sessions = require('./../sessions');
const bot = require('./../bot.config.js');
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
    bot.onReplyToMessage(senderId, messageId, message => {
      if (message.text.toUpperCase() === 'Y') {
        dbEntries.clear(currentUser.id).then(() => {
          bot.sendMessage(senderId, 'Данные очищены');
        }).catch(error => {
          console.error(error);
          bot.sendMessage(senderId, 'Ошибка в операции');
        });
      } else {
        bot.sendMessage(senderId, 'Операция не выполнена');
      }
    });
  });
}

module.exports = onDBCLEAR;
