const { pool } = require('../../../db/sql');
const passportQueries = require('../../../db/selectors/passport');

module.exports = async function ({ email, password }) {
  try {
    const botInfo = await pool.connect(async (connection) => {
      const result = await connection.one(
        passportQueries.getPassport(email, password),
      );
      return result;
    });
    if (!botInfo) {
      throw new Error('Invalid email or password.');
    }
    return Promise.resolve(botInfo);
  } catch (error) {
    return Promise.reject(this.error(400, error.message, error));
  }
};
