const bot = require('../bot');
const sessions = require('../services/session.service');
const logger = require('../services/logger.service');
const startAPI = require('../api/v1/start');
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
    const startResult = await startAPI(currentUser);
    await bot.sendMessage(chatId, startResult);
  } catch (error) {
    logger.log('error', error);
    await bot.sendMessage(chatId, 'Операция не выполнена');
  }
};

module.exports = onStart;
