const { pool } = require('../../../db/sql');
const assistantQueries = require('../../../db/selectors/assistant');

module.exports = async function ({ email }) {
  try {
    const client = await pool.connect(async (connection) => {
      const assistantBot = await connection.maybeOne(
        assistantQueries.selectAssistantBotByEmail(email),
      );
      return assistantBot;
    });
    return Promise.resolve(client);
  } catch (error) {
    return Promise.reject(this.error(400, error.message, error));
  }
};
