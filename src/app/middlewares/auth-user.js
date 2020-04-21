const auth = require('http-auth');
const passportQueries = require('../../db/selectors/passport');
const { pool } = require('../../db/sql');
const logger = require('../../lib/log');

// example: demo@gotointeractive.com:demo
const basic = auth.basic(
  {
    realm: 'Web.', // for website
  },
  async (login, password, callback) => {
    try {
      const botId = await pool.connect(async (connection) => {
        const botId = await connection.maybeOne(
          passportQueries.checkByEmailAndMasterPassword(login, password),
        );
        return botId;
      });
      // todo проверять rbac'ом
      callback(Boolean(botId));
    } catch (error) {
      callback(false);
    }
  },
);

basic.on('success', (result) => {
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
