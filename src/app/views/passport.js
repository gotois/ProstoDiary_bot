const crypto = require('crypto');
const { SERVER } = require('../../environment');
/**
 * @param {object} passport - passport
 * @returns {object} - jsonld
 */
module.exports = (passport) => {
  let email;
  let gender;
  let name;
  let birthPlace;
  let birthDate;
  let image;
  const sameAs = [];

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

  // шифруем пользовательский адрес почты в md5 для того чтобы злоумышленник не знал прямого адреса почты
  const emailMD5 = crypto.createHash('md5').update(email).digest('hex');
  const url = `${SERVER.HOST}/passport/${emailMD5}`; // считаем URI каждого физического человека является ссылкой на его дневник
  // getting avatar from gravatar
  if (email) {
    image = `https://www.gravatar.com/avatar/${emailMD5}`;
  }

  return {
    '@context': 'https://json-ld.org/contexts/person.jsonld',
    '@type': 'Person',
    'email': email,
    'name': name,
    'image': image,
    'url': url,
    'telephone': passport.phone,
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
  };
};
