const crypto = require('crypto');
const { pool } = require('../../../db/sql');
const passportQueries = require('../../../db/selectors/passport');
const { SERVER } = require('../../../environment');

module.exports = async (request, response) => {
  try {
    let email;
    const clientData = await pool.connect(async (connection) => {
      const passport = await connection.one(
        passportQueries.getPassportByEmail(request.params.user),
      );
      email = passport.yandex_passport.default_email.replace(
        '@yandex.ru',
        '@ya.ru',
      ); // hack чтобы находился gravatar
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

      return passport;
    });
    const emailMD5 = crypto.createHash('md5').update(email).digest('hex');

    response
      .contentType('application/ld+json')
      .status(200)
      .send({
        '@context': 'https://json-ld.org/contexts/person.jsonld',
        '@type': 'Person',
        'email': email,
        'name': clientData.yandex_passport.real_name,
        'image': `https://www.gravatar.com/avatar/${emailMD5}`, // getting avatar from gravatar
        'url': `${SERVER.HOST}/passport/${request.params.user}`, // считаем URI каждого физического человека является ссылкой на его дневник
        'telephone': clientData.phone,
        'gender': clientData.yandex_passport.sex, // поддержать facebook
        // todo все ниже требует отдельных SPARQL запросов к search-bot
        // worksFor
        // affiliation
        // sameAs
        // alternateName
        // jobTitle
        // birthPlace
        // height
        // nationality
        // memberOf
        // birthDate
        // alumniOf
        // address
        // colleague
      });
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
};
