const { pool } = require('../../../db/sql');
const passportQueries = require('../../../db/selectors/passport');

module.exports = async function ({ phone }) {
  try {
    const clientData = await pool.connect(async (connection) => {
      const client = await connection.maybeOne(
        passportQueries.selectUserByPhone(phone),
      );
      return client;
    });
    return Promise.resolve(clientData);
  } catch (error) {
    return Promise.reject(this.error(400, error.message, error));
  }
};
