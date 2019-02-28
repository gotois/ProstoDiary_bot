const sessions = require('../services/session.service');
const bot = require('../config');
const dbEntries = require('../database');
const crypt = require('../services/crypt.service');
const format = require('../services/format.service');
const logger = require('../services/logger.service');
/**
 * @param {string} input - text
 * @returns {string}
 */
const formatResponse = (input) => {
  return format.prevInput(input) + '\n_Запись обновлена_';
};
/**
 * Сообщение удалено?
 *
 * @param {string} message - message
 * @returns {boolean}
 */
const isDeletedMessage = (message) => {
  /**
   * @constant
   * @type {string[]}
   */
  const DELETE_VARIABLES = ['del', 'delete'];
  return DELETE_VARIABLES.some((del) => {
    return message.toLowerCase() === del.toLowerCase();
  });
};
/**
 * Обновление текста в БД
 *
 * @param {Object} msg - msg
 * @param {Object} msg.chat - chat
 * @param {Object} msg.from - from
 * @param {string} msg.text - text
 * @param {string} msg.message_id - message
 * @returns {undefined}
 */
const onEditedMessageText = async ({ chat, from, text, message_id }) => {
  logger.log('info', onEditedMessageText.name);
  const chatId = chat.id;
  const input = text.trim();
  if (input.startsWith('/')) {
    await bot.sendMessage(chatId, 'Редактирование этой записи невозможно');
    return;
  }
  const currentUser = sessions.getSession(from.id);
  // TODO: https://github.com/gotois/ProstoDiary_bot/issues/34
  if (isDeletedMessage(input)) {
    try {
      await dbEntries.delete(currentUser.id, message_id);
      await bot.sendMessage(chatId, 'Message removed');
    } catch (error) {
      logger.log('error', error.toString());
      await bot.sendMessage(chatId, error.toLocaleString());
    }
  } else {
    try {
      await dbEntries.put(
        currentUser.id,
        crypt.encode(input),
        new Date(),
        message_id,
      );
      await bot.sendMessage(chatId, formatResponse(input), {
        parse_mode: 'Markdown',
      });
    } catch (error) {
      logger.log('error', error.toString());
      await bot.sendMessage(chatId, error.toLocaleString());
    }
  }
};

module.exports = onEditedMessageText;
