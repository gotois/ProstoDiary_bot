const dbEntries = require('../database/bot.database');
const sessions = require('../services/session.service');
const bot = require('./../config/bot.config');
/***
 * Очистить базу данных с подтверждением
 * @param msg {Object}
 * @param msg.chat {Object}
 * @param msg.from {Object}
 * @return {void}
 */
const onDBCLEAR = async ({chat, from}) => {
  const chatId = chat.id;
  const fromId = from.id;
  const options = {
    'reply_markup': {
      'force_reply': true
    }
  };
  const currentUser = sessions.getSession(fromId);
  bot.sendMessage(chatId, 'Очистить ваши записи? (Y/N)', options).then(({chat, message_id}) => {
    const senderId = chat.id;

    return bot.onReplyToMessage(senderId, message_id, ({text}) => {
      if (text.toUpperCase() !== 'Y') {
        return bot.sendMessage(senderId, 'Операция не выполнена');
      }
      return dbEntries.clear(currentUser.id).then(() => (
        bot.sendMessage(senderId, 'Данные очищены')
      )).catch(error => {
        console.error(error);
        return bot.sendMessage(senderId, 'Ошибка в операции');
      });
    });
  });
};

module.exports = onDBCLEAR;
