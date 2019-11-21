const auth = require('http-auth');
const { sql, pool } = require('../core/database');

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
    // todo: поддержать 2auth авторизацию
    await pool.connect(async (connection) => {
      try {
        const user = await connection.one(sql`SELECT
    1
FROM
    bot
WHERE
    email = ${login}
    AND secret_password = crypt(${password}, secret_password)
`);
        callback(user);
      } catch {
        callback(false);
      }
    });
  },
);

module.exports = auth.connect(basic);
