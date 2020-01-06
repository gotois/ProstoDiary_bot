const auth = require('http-auth');
const passportQueries = require('../db/passport');
const { pool } = require('../core/database');

// example: demo@gotointeractive.com:demo
const basic = auth.basic(
  {
    realm: 'Web.', // for website
  },
  async (login, password, callback) => {
    if (login === 'demo' && password === 'demo') {
      callback(true);
      return;
    }
    const botId = await pool.connect(async (connection) => {
      const botId = await connection.maybeOne(
        passportQueries.checkByLoginAndPassword(login, password),
      );
      return botId;
    });
    callback(Boolean(botId));
  },
);

module.exports = auth.connect(basic);
