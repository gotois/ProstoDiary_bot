const auth = require('http-auth');
const passportQueries = require('../../db/selectors/passport');
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
    const botId = await pool.connect(async (connection) => {
      const result = await connection.maybeOne(
        passportQueries.checkByEmailAndMasterPassword(login, password),
      );
      return result;
    });
    // todo проверять rbac'ом
    callback(Boolean(botId));
  } catch (error) {
    callback(false);
  }
};

const basic = auth.basic(
  {
    realm: 'Web.', // for website
  },
  checker,
);

basic.on('success', (result) => {
  if (!result.user) {
    throw new Error('unknown user');
  }
  logger.info(`User authenticated: ${result.user}`);
});

basic.on('fail', (result) => {
  if (result.user) {
    logger.info(`User authentication failed: ${result.user}`);
  }
});

basic.on('error', (error) => {
  logger.error(`Authentication error: ${error.code + ' - ' + error.message}`);
});

module.exports = basic;
