const sessions = require('../services/session.service');
const bot = require('./../config/bot.config');
const dbUsers = require('./../database/database.users');
const logger = require('../services/logger.service');
/***
 * При первом включении создаем в БД специальную колонку для работы
 * @param msg {Object}
 * @param msg.chat {Object}
 * @param msg.from {Object}
 * @return {void}
 */
const onStart = async ({chat, from}) => {
  const chatId = chat.id;
  const currentUser = sessions.getSession(from.id);
  try {
    const {rowCount} = await dbUsers.check(currentUser.id);
    if (rowCount === 0) {
      await dbUsers.post(currentUser.id);
      await bot.sendMessage(chatId, 'Вы вошли в систему');
    } else {
      await bot.sendMessage(chatId, 'Повторный вход не требуется');
    }
  } catch (error) {
    logger.log('error', error);
    await bot.sendMessage(chatId, 'Операция не выполнена');
  }
};

module.exports = onStart;
