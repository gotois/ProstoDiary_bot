const package_ = require('../../../../package.json');
const { pool } = require('../../../db/sql');
const passportQueries = require('../../../db/passport');
const logger = require('../../../lib/log');
const twoFactorAuthService = require('../../../services/2fa.service');

/**
 * @param {jsonld} jsonld - parameters
 * @param {object} passport - passport gotoisCredentions
 * @returns {Promise<*>}
 */
module.exports = async function(jsonld, { passport }) {
  logger.info('signin');

  if (passport.activated) {
    const document = {
      '@context': 'http://schema.org',
      '@type': 'RejectAction',
      'agent': {
        '@type': 'Person',
        'name': package_.name,
        'url': package_.homepage,
      },
      'object': {
        '@type': 'ExercisePlan',
        'name': 'xxxxxxx',
      },
      'purpose': {
        '@type': 'MedicalCondition',
        'text': 'Бот уже активирован',
      },
    };
    return Promise.reject(this.error(400, null, document));
  }

  // const date = jsonld.startTime;
  const tokenValue = jsonld.subjectOf.find((subject) => {
    return subject.name === 'token';
  });
  const token = tokenValue.abstract;
  const valid = twoFactorAuthService.verifyUser(passport.secret_key, token);
  if (!valid) {
    // todo Превышено число попыток входа. Начните снова через N секунд
    //  ...
    const document = {
      '@context': 'http://schema.org',
      '@type': 'RejectAction',
      'agent': {
        '@type': 'Person',
        'name': package_.name,
        'url': package_.homepage,
      },
      'object': {
        '@type': 'ExercisePlan',
        'name': 'xxxxxxx',
      },
      'purpose': {
        '@type': 'MedicalCondition',
        'text': 'Неверный ключ. Попробуйте снова',
      },
    };
    return Promise.reject(this.error(400, null, document));
  }

  await pool.connect(async (connection) => {
    try {
      await connection.query(
        passportQueries.activateByPassportId(passport.passport_id),
      );
    } catch (error) {
      logger.error(error.message);
      throw error;
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
      'abstract': String('Бот активирован').toString('base64'),
      'encodingFormat': 'text/markdown',
    },
  };
  return Promise.resolve(document);
};
