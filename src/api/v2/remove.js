const dbEntries = require('../../database/entities.database');
/**
 * @param {object} currentUser - currentUser
 * @param {number} message_id - telegram_message_id
 * @returns {jsonrpc}
 */
module.exports = async (currentUser, message_id) => {
  try {
    await dbEntries.delete(currentUser, message_id);
    return {
      jsonrpc: '2.0',
      result: 'Запись удалена',
    };
  } catch (error) {
    return {
      jsonrpc: '2.0',
      error: {
        message: error.message.toString(),
      },
    };
  }
};
