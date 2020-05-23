const { pool } = require('../../../db/sql');
const marketplaceQueries = require('../../../db/selectors/marketplace');

module.exports = async function ({ client_id }) {
  try {
    const client = await pool.connect(async (connection) => {
      // сверяем что такой client_id ассистента существует
      const marketplace = await connection.one(
        marketplaceQueries.selectMarketAssistant(client_id),
      );
      return marketplace;
    });
    return Promise.resolve(client);
  } catch (error) {
    return Promise.reject(this.error(400, error.message, error));
  }
};
