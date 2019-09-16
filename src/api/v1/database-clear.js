const dbEntries = require('../../database/entities.database');
/**
 * @returns {jsonrpc}
 */
module.exports = async (userId) => {
  try {
    await dbEntries.clear(userId);
    return {
      jsonrpc: '2.0',
      result: 'Данные очищены',
    };
  } catch (error) {
    return {
      jsonrpc: '2.0',
      error: {
        message: error.toString(),
      },
    };
  }
};
