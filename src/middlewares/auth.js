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
    await pool.connect(async (connection) => {
      try {
        const user = await connection.one(
          passportQueries.checkByLoginAndPassword(login, password),
        );
        callback(user);
      } catch {
        callback(false);
      }
    });
  },
);

module.exports = auth.connect(basic);
