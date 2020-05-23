const { pool } = require('../../../db/sql');
const marketplaceQueries = require('../../../db/selectors/marketplace');

module.exports = async function ({ values }) {
  try {
    await pool.connect(async (connection) => {
      const { rows } = await connection.query(marketplaceQueries.selectAll());
      if (rows.length > 0) {
        throw new Error('Assistants exists. Please delete it if needs');
      }
      await connection.query(marketplaceQueries.createAssistant(values));
    });
    return Promise.resolve(values);
  } catch (error) {
    return Promise.reject(this.error(400, error.message, error));
  }
};
