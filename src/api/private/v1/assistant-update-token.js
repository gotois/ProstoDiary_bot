const { pool } = require('../../../db/sql');
const assistantQueries = require('../../../db/selectors/assistant');

module.exports = async function ({ token, bot_user_email }) {
  try {
    await pool.connect(async (connection) => {
      await connection.query(
        assistantQueries.updateAssistantBotToken(token, bot_user_email),
      );
    });
    return Promise.resolve(true);
  } catch (error) {
    return Promise.reject(this.error(400, error.message, error));
  }
};
