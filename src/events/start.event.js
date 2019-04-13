const bot = require('../bot');
const sessions = require('../services/session.service');
const dbUsers = require('./../database/database.users');
const logger = require('../services/logger.service');
/**
 * При первом включении создаем в БД специальную колонку для работы
 *
 * @param {Object} msg - message
 * @param {Object} msg.chat - chat
 * @param {Object} msg.from - from
 * @returns {undefined}
 */
const onStart = async ({ chat, from }) => {
  logger.log('info', onStart.name);
  const chatId = chat.id;
  const currentUser = sessions.getSession(from.id);
  try {
    const { rowCount } = await dbUsers.check(currentUser.id);
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
