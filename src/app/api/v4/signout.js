const package_ = require('../../../../package.json');
const { pool } = require('../../../db/database');
const passportQueries = require('../../../db/passport');

module.exports = async function(jsonld, { passport }) {
  const signOutResult = await pool.connect(async (connection) => {
    try {
      const botTable = await connection.one(
        passportQueries.selectByPassport(passport.id),
      );
      if (!botTable.activated) {
        return 'Бот уже был деактивирован';
      }
      // todo: деактивировать почтовый ящик https://yandex.ru/dev/pdd/doc/reference/email-edit-docpage/
      //  ...
      await connection.query(
        passportQueries.deactivateByPassportId(passport.id),
      );
      return 'Бот деактивирован';
    } catch (error) {
      return `Вход закончился ошибкой: ${error.message}`;
    }
  });
  const document = {
    '@context': 'http://schema.org',
    '@type': 'AcceptAction',
    'agent': {
      '@type': 'Person',
      'name': package_.name,
    },
    'purpose': {
      '@type': 'Answer',
      'abstract': String(signOutResult).toString('base64'),
      'encodingFormat': 'text/markdown',
    },
  };
  return Promise.resolve(document);
};
