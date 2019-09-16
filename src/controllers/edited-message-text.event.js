const bot = require('../core');
const logger = require('../services/logger.service');
const APIv2 = require('../api/v2');
const dbEntries = require('../database/entities.database');
/**
 * @constant
 * @type {string[]}
 */
const DELETE_VARIABLES = ['del', 'remove'];
/**
 * Сообщение удалено?
 *
 * @param {string} message - message
 * @returns {boolean}
 */
const isDeletedMessage = (message) => {
  return DELETE_VARIABLES.some((del) => {
    return message.toLowerCase() === del.toLowerCase();
  });
};
/**
 * Обновление текста в БД
 *
 * @param {object} msg - msg
 * @param {object} msg.chat - chat
 * @param {object} msg.from - from
 * @param {string} msg.text - text
 * @param {string} msg.message_id - message
 * @returns {undefined}
 */
const onEditedMessageText = async ({ chat, from, text, date, message_id }) => {
  logger.log('info', onEditedMessageText.name);
  const chatId = chat.id;
  const input = text.trim();
  if (input.startsWith('/')) {
    await bot.sendMessage(chatId, 'Редактирование этой записи невозможно');
    return;
  }
  if (isDeletedMessage(input)) {
    const { error, result } = await APIv2.remove(from.id, message_id);
    if (error) {
      logger.log('error', error.toString());
      await bot.sendMessage(chatId, 'Не удалена');
      return;
    }
    await bot.sendMessage(chatId, result);
    return;
  }
  const isExist = await dbEntries.exist(currentUser.id, message_id);
  if (!isExist) {
    // TODO: если записи нет - тогда спрашиваем пользователя, создавать ли новую запись?
    await bot.sendMessage(chatId, 'Запись не найдена');
    return;
  }
  // TODO: https://github.com/gotois/ProstoDiary_bot/issues/34
  const { error, result } = await APIv2.editedMessageTextAPI(
    text,
    date,
    message_id,
    currentUser,
  );
  if (error) {
    logger.error(error);
    await bot.sendMessage(chatId, error.toLocaleString());
    return;
  }
  await bot.sendMessage(chatId, result, {
    parse_mode: 'Markdown',
  });
};

module.exports = onEditedMessageText;
