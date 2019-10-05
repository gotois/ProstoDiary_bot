const bot = require('../core/bot');
const logger = require('../services/logger.service');
/**
 * @description Очистить базу данных с подтверждением
 * @param {object} msg - message
 * @param {object} msg.chat - chat
 * @param {object} msg.from - from
 * @returns {undefined}
 */
const onDatabaseClear = async ({ chat, from }) => {
  logger.log('info', onDatabaseClear.name);
  const chatId = chat.id;
  const fromId = from.id;
  const options = {
    reply_markup: {
      force_reply: true,
    },
  };
  const { message_id } = await bot.sendMessage(
    chatId,
    'Очистить ваши записи?\nНапишите: YES',
    options,
  );
  const dbClearAPI = require('../api/v1/database-clear');
  // todo: проверять выгружен ли был бэкап, и если нет - предупреждать пользователя
  bot.onReplyToMessage(chat.id, message_id, async ({ text }) => {
    if (text !== 'YES') {
      await bot.sendMessage(chat.id, 'Операция отменена');
      return;
    }
    const { error, result } = await dbClearAPI(fromId);
    if (error) {
      logger.log('error', error);
      await bot.sendMessage(chat.id, 'Ошибка в операции');
      return;
    }
    await bot.sendMessage(chat.id, result);
  });
};

module.exports = onDatabaseClear;
