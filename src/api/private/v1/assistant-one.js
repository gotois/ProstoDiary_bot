const { pool } = require('../../../db/sql');
const marketplaceQueries = require('../../../db/selectors/marketplace');

module.exports = async function ({ id }) {
  try {
    const client = await pool.connect(async (connection) => {
      const marketplace = await connection.one(
        marketplaceQueries.selectByClientId(id),
      );
      return marketplace;
    });
    return Promise.resolve(client);
  } catch (error) {
    return Promise.reject(this.error(400, error.message, error));
  }
};
