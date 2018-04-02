const sessions = require('../services/session.service');
const bot = require('../config');
const dbEntries = require('../database');
const crypt = require('../services/crypt.service');
const format = require('../services/format.service');
const logger = require('../services/logger.service');
/**
 * @param input {string}
 * @return {string}
 */
const formatResponse = (input) => {
  return format.prevInput(input) + '\n_Запись обновлена_';
};
/**
 * @param message {String}
 * @returns {boolean}
 */
const isDeleteMessage = (message) => {
  /**
   * @constant
   * @type {string[]}
   */
  const DELETE_VARIABLES = ['del', 'delete'];
  return DELETE_VARIABLES.some(del => message.toLowerCase() === del.toLowerCase());
};
/***
 * Обновление текста в БД
 * @param msg {Object}
 * @param msg.chat {Object}
 * @param msg.from {Object}
 * @param msg.text {String}
 * @param msg.message_id {String}
 * @return {void}
 */
const onEditedMessageText = async ({chat, from, text, message_id}) => {
  const chatId = chat.id;
  const input = text.trim();
  if (input.startsWith('/')) {
    await bot.sendMessage(chatId, 'Редактирование этой записи невозможно');
    return;
  }
  const currentUser = sessions.getSession(from.id);
  if (isDeleteMessage(input)) {
    try {
      await dbEntries.delete(currentUser.id, message_id);
      await bot.sendMessage(chatId, 'Message removed');
    } catch (error) {
      logger.log('error', error.toString());
      await bot.sendMessage(chatId, error.toLocaleString());
    }
  } else {
    try {
      await dbEntries.put(currentUser.id, crypt.encode(input), new Date(), message_id);
      await bot.sendMessage(chatId, formatResponse(input), {
        'parse_mode': 'Markdown',
      });
    } catch (error) {
      logger.log('error', error.toString());
      await bot.sendMessage(chatId, error.toLocaleString());
    }
  }
};

module.exports = onEditedMessageText;
