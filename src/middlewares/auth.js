const auth = require('http-auth');
const passportQueries = require('../db/passport');
const { pool } = require('../core/database');

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

module.exports = auth.connect(basic);
