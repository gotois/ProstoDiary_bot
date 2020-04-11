const auth = require('http-auth');
const assistantQueries = require('../../db/selectors/assistant');
const { pool } = require('../../db/sql');
const logger = require('../../lib/log');

const basic = auth.basic(
  {
    realm: 'API.',
  },
  async (login, password, callback) => {
    try {
      const assistant = await pool.connect(async (connection) => {
        const assistant = await connection.maybeOne(
          assistantQueries.check(login, password),
        );
        return assistant;
      });
      callback(Boolean(assistant));
    } catch (error) {
      callback(false);
    }
  },
);

basic.on('success', (result) => {
  logger.info(`Assistant authenticated: ${result.user}`);
});

basic.on('fail', (result) => {
  logger.info(`Assistant authentication failed: ${result.user}`);
});

basic.on('error', (error) => {
  logger.error(`Authentication error: ${error.code + ' - ' + error.message}`);
});

module.exports = basic;
