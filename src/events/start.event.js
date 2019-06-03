const bot = require('../bot');
const sessions = require('../services/session.service');
const dbUsers = require('../database/users.database');
const logger = require('../services/logger.service');
/**
 * При первом включении создаем в БД специальную колонку для работы
 *
 * @param {object} msg - message
 * @param {object} msg.chat - chat
 * @param {object} msg.from - from
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
      return;
    }
    await bot.sendMessage(chatId, 'Повторный вход не требуется');
  } catch (error) {
    logger.log('error', error);
    await bot.sendMessage(chatId, 'Операция не выполнена');
  }
};

module.exports = onStart;
