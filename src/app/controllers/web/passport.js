const crypto = require('crypto');
const { pool } = require('../../../db/sql');
const passportQueries = require('../../../db/selectors/passport');
const { SERVER } = require('../../../environment');

module.exports = async (request, response) => {
  let email;
  let gender;
  let name;
  let birthPlace;
  let birthDate;
  let image;
  const sameAs = [];
  try {
    // шифруем пользовательский адрес почты в md5 для того чтобы злоумышленник не знал прямого адреса почты
    const urlMD5 = crypto
      .createHash('md5')
      .update(request.params.user)
      .digest('hex');
    const url = `${SERVER.HOST}/passport/${urlMD5}`; // считаем URI каждого физического человека является ссылкой на его дневник
    const clientData = await pool.connect(async (connection) => {
      const passport = await connection.one(
        passportQueries.getPassportByEmail(request.params.user),
      );
      if (passport.yandex_passport) {
        name = passport.yandex_passport.real_name;
        gender = passport.yandex_passport.sex;
        email = passport.yandex_passport.default_email.replace(
          '@yandex.ru',
          '@ya.ru',
        ); // hack чтобы находился gravatar
      }
      if (passport.facebook_passport) {
        birthPlace = passport.facebook_passport.hometown.name;
        birthDate = passport.facebook_passport.birthday;
        sameAs.push(passport.facebook_passport.link);
      }

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
    // getting avatar from gravatar
    if (email) {
      const emailMD5 = crypto.createHash('md5').update(email).digest('hex');
      image = `https://www.gravatar.com/avatar/${emailMD5}`;
    }
    response.contentType('application/ld+json').status(200).send({
      '@context': 'https://json-ld.org/contexts/person.jsonld',
      '@type': 'Person',
      'email': email,
      'name': name,
      'image': image,
      'url': url,
      'telephone': clientData.phone,
      'gender': gender,
      'birthPlace': birthPlace,
      'birthDate': birthDate,
      'sameAs': sameAs,
      // todo все ниже требует отдельных SPARQL запросов к search-bot
      // alternateName
      // jobTitle
      // worksFor
      // affiliation
      // height - можно брать из health-bot
      // nationality -
      // memberOf
      // alumniOf
      // address
      // colleague
    });
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
};
