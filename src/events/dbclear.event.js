const bot = require('../bot');
const dbEntries = require('../database/entities.database');
const sessions = require('../services/session.service');
const logger = require('../services/logger.service');
/**
 * Очистить базу данных с подтверждением
 *
 * @param {object} msg - message
 * @param {object} msg.chat - chat
 * @param {object} msg.from - from
 * @returns {undefined}
 */
const onDBClear = async ({ chat, from }) => {
  logger.log('info', onDBClear.name);
  const chatId = chat.id;
  const fromId = from.id;
  const options = {
    reply_markup: {
      force_reply: true,
    },
  };
  const currentUser = sessions.getSession(fromId);
  const { message_id } = await bot.sendMessage(
    chatId,
    'Очистить ваши записи?\nНапишите: YES',
    options,
  );
  await bot.onReplyToMessage(chat.id, message_id, async ({ text }) => {
    if (text !== 'YES') {
      await bot.sendMessage(chat.id, 'Операция отменена');
      return;
    }
    try {
      await dbEntries.clear(currentUser.id);
      await bot.sendMessage(chat.id, 'Данные очищены');
    } catch (error) {
      logger.log('error', error);
      await bot.sendMessage(chat.id, 'Ошибка в операции');
    }
  });
};

module.exports = onDBClear;
