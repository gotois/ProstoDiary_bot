const auth = require('http-auth');
const marketplaceQueries = require('../../db/selectors/marketplace');
const { pool } = require('../../db/sql');
const logger = require('../../lib/log');
/**
 * @param {string} login - login
 * @param {string} password - password
 * @param {Function} callback - callback
 * @returns {Promise<boolean>}
 */
const checker = async (login, password, callback) => {
  try {
    const market = await pool.connect(async (connection) => {
      const result = await connection.maybeOne(
        marketplaceQueries.check(login, password),
      );
      return result;
    });
    // todo проверять rbac'ом
    callback(Boolean(market));
  } catch {
    callback(false);
  }
};

const basic = auth.basic(
  {
    realm: 'API.',
  },
  checker,
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
