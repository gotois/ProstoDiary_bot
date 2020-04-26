const mc = require('../../middlewares/memcache');
const { pool } = require('../../../db/sql');
const passportQueries = require('../../../db/selectors/passport');
const template = require('../../views/passport');

module.exports = async (request, response) => {
  try {
    const key = 'passport:' + request.params.user;
    const prime = await mc.get(key);
    if (prime && prime.value) {
      const value = prime.value.toString();
      response.contentType('application/ld+json').send(JSON.parse(value));
    } else {
      const clientData = await pool.connect(async (connection) => {
        const clientData = await connection.one(
          passportQueries.getPassportByEmail(request.params.user),
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
      response.contentType('application/ld+json').send(data);
    }
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
};
