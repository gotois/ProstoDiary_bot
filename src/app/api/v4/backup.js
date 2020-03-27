const package_ = require('../../../../package.json');
const logger = require('../../../lib/log');
const passportQueries = require('../../../db/passport');
const { pool } = require('../../../db/database');
const { pack } = require('../../../services/archive.service');
const twoFactorAuthService = require('../../../services/2fa.service');
const storyQueries = require('../../../db/story');
const { convertIn2DigitFormat } = require('../../../services/date.service');

/**
 * @param {Array} stories - entries
 * @returns {buffer}
 */
const getTextFromStories = (stories) => {
  let currentDateString = '';
  const data = stories
    .reduce((accumulator, { created_at, content }) => {
      const date = new Date(created_at);
      const DD = convertIn2DigitFormat(date.getDate());
      const MM = convertIn2DigitFormat(date.getMonth() + 1);
      const YYYY = date.getFullYear();
      const dateString = `${DD}.${MM}.${YYYY}`;

      if (dateString !== currentDateString) {
        accumulator += `\n${dateString}\n`;
      }
      currentDateString = dateString;
      accumulator += content.toString() + '\n';
      return accumulator;
    }, '')
    .trim();
  return Buffer.from(data, 'utf8');
};

/**
 * @param {jsonld} jsonld - parameters
 * @param {object} passport - passport gotoisCredentions
 * @returns {Promise<*>}
 */
module.exports = async function(jsonld, { passport }) {
  logger.info('ping');

  const date = jsonld.startTime;
  const tokenValue = jsonld.subjectOf.find((subject) => {
    return subject.name === 'token';
  });
  const token = tokenValue.abstract;
  const sortingValue = jsonld.subjectOf.find((subject) => {
    return subject.name === 'sorting';
  });
  const sorting = sortingValue.abstract;
  let stories;

  try {
    stories = await pool.connect(async (connection) => {
      const botTable = await connection.one(
        passportQueries.selectByPassport(passport.id),
      );
      const valid = twoFactorAuthService.verifyUser(botTable.secret_key, token);
      if (!valid) {
        return Promise.reject(
          this.error(400, 'Неверный ключ. Попробуйте снова'),
        );
      }
      const rows = await connection.many(
        storyQueries.selectStoryByDate({
          publisherEmail: botTable.email,
          sorting,
        }),
      );
      return rows;
    });
  } catch (error) {
    return Promise.reject(this.error(400, error.message || 'db error'));
  }
  const txtPack = await pack([
    {
      buffer: getTextFromStories(stories),
      filename: `backup_${date}.txt`,
    },
  ]);

  // todo отправка на почту теперь будет делаться через ассистента
  const document = {
    '@context': 'http://schema.org',
    '@type': 'AssignAction',
    'agent': {
      '@type': 'Person',
      'name': package_.name,
    },
    'purpose': {
      '@type': 'EmailMessage',
      'sender': {
        '@type': 'Person',
        'name': 'Dom Portwood',
        'email': 'dportwood@example.com',
      },
      'toRecipient': {
        '@type': 'Person',
        'name': 'Peter Gibbons',
        'email': 'pgibbons@example.com',
      },
      'about': {
        '@type': 'Thing',
        'name': 'Backup ProstoDiary: Your story backup',
      },
      'messageAttachment': {
        '@type': 'CreativeWork',
        'name': 'backup.zip',
        // 'text': 'xxxxx', // используется для фолбека если нет возможности отправить html
        'abstract': txtPack.toString('base64'),
        'encodingFormat': 'application/zip',
      },
    },
    'result': {
      '@type': 'Answer',
      'text': 'Данные успешно отправлены на вашу почту',
    },
  };
  return Promise.resolve(document);
};
