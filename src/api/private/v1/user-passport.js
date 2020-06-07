const { pool } = require('../../../db/sql');
const passportQueries = require('../../../db/selectors/passport');
const mc = require('../../../lib/memcache');
const template = require('../../../app/public/views/passport');

module.exports = async function ({ user }) {
  try {
    const key = 'passport:' + user;
    const prime = await mc.get(key);
    if (prime && prime.value) {
      const value = prime.value.toString();
      return Promise.resolve(JSON.parse(value));
    }
    const clientData = await pool.connect(async (connection) => {
      const clientData = await connection.one(
        passportQueries.getPassportByEmail(user),
      );
      // todo уведомляем на почту если oauth сессия устарела на почту
      /*
      if (
          passport.yandex_session &&
          passport.yandex_session.expires_in < currentDate
        ) {
          await mail.send({
            to: passport.yandex_passport.email,
            from: botTable.email,
            subject: 'Oauth yandex session is over, please update',
            html: `
        <a>todo</a>
    `,
          });
      if (
        passport.facebook_session &&
        passport.facebook_session.expires_in < currentDate
      ) {
        await mail.send({
          to: passport.facebook_passport.email,
          from: botTable.email,
          subject: 'Oauth facebook session is over, please update',
          html: `
        <a>todo</a>
    `,
        });
        */

      return clientData;
    });
    const data = await template(clientData);
    await mc.set(key, JSON.stringify(data), { expires: 500 });
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(this.error(400, error.message, error));
  }
};
