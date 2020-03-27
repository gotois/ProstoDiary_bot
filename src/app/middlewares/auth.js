const auth = require('http-auth');
const passportQueries = require('../../db/passport');
const { pool } = require('../../db/database');
const logger = require('../../services/logger.service');

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
  logger.info(`User authentication failed: ${result.user}`);
});

basic.on('error', (error) => {
  logger.error(`Authentication error: ${error.code + ' - ' + error.message}`);
});

module.exports = basic;
