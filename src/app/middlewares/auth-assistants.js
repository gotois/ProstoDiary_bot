const auth = require('http-auth');
const marketplaceQueries = require('../../db/selectors/marketplace');
const { pool } = require('../../db/sql');
const logger = require('../../lib/log');

const basic = auth.basic(
  {
    realm: 'API.',
  },
  async (login, password, callback) => {
    try {
      const market = await pool.connect(async (connection) => {
        const result = await connection.maybeOne(
          marketplaceQueries.check(login, password),
        );
        return result;
      });
      callback(Boolean(market));
    } catch (error) {
      callback(false);
    }
  },
);

basic.on('success', (result) => {
  logger.info(`Assistant authenticated: ${result.user}`);
});

basic.on('fail', (result) => {
  if (result.user) {
    logger.warn(`Assistant authentication failed: ${result.user}`);
  }
});

basic.on('error', (error) => {
  logger.error(`Authentication error: ${error.code + ' - ' + error.message}`);
});

module.exports = basic;
