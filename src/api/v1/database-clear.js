const dbEntries = require('../../database/entities.database');
/**
 * @returns {jsonrpc}
 */
module.exports = async (currentUser) => {
  try {
    await dbEntries.clear(currentUser.id);
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
