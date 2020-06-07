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
      // проверка на пользователя/бот
      if (login.endsWith('@gotointeractive.com')) {
        // это бот
        const result = await connection.maybeOne(
          passportQueries.checkByBotEmailAndBotEmailPassword(login, password),
        );
        return result;
      } else {
        // это пользователь
        const result = await connection.maybeOne(
          passportQueries.checkByEmailAndMasterPassword(login, password),
        );
        return result;
      }
    });
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
