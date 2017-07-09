const sessions = require('../services/sessions');
const bot = require('./../config/bot.config');
const dbUsers = require('./../database/database.users');
/***
 * При первом включении создаем в БД специальную колонку для работы
 * @param msg {Object}
 * @param msg.chat {Object}
 * @param msg.from {Object}
 * @return {void}
 */
function onStart({chat, from}) {
  const chatId = chat.id;
  const fromId = from.id;
  const currentUser = sessions.getSession(fromId);
  dbUsers.check(currentUser.id).then(({rowCount}) => {
    if (rowCount === 0) {
      return dbUsers.post(currentUser.id).then(() => (
        bot.sendMessage(chatId, 'Вы вошли в систему')
      ));
    } else {
      return bot.sendMessage(chatId, 'Повторный вход не требуется');
    }
  }).catch(error => {
    console.error(error);
    return bot.sendMessage(chatId, 'Операция не выполнена');
  });
}

module.exports = onStart;
