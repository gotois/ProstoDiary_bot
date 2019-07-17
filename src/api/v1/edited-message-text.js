const format = require('../../services/format.service');
const crypt = require('../../services/crypt.service');
const dbEntries = require('../../database/entities.database');
/**
 * @param {string} input - text
 * @returns {string}
 */
const formatResponse = (input) => {
  return format.previousInput(input) + '\n_Запись обновлена_';
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

module.exports = async (text, message_id, currentUser) => {
  const input = text.trim();
  if (input.startsWith('/')) {
    return 'Редактирование этой записи невозможно';
  }
  // TODO: https://github.com/gotois/ProstoDiary_bot/issues/34
  if (isDeletedMessage(input)) {
    await dbEntries.delete(currentUser.id, message_id);
    return 'Message removed';
  }
  // TODO: если записи нет - тогда что делать???
  const isExist = await dbEntries.exist(currentUser.id, message_id);
  if (!isExist) {
    throw new Error('Message not exist');
  }
  await dbEntries.put(
    currentUser.id,
    crypt.encode(input),
    new Date(),
    message_id,
  );
  return formatResponse(input);
};
