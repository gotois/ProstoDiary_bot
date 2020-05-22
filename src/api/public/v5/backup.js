const logger = require('../../../lib/log');
const passportQueries = require('../../../db/selectors/passport');
const { pack } = require('../../../services/archive.service');
const twoFactorAuthService = require('../../../services/2fa.service');
const commandLogger = require('../../../services/command-logger.service');
const { convertIn2DigitFormat } = require('../../../services/date.service');
const { pool } = require('../../../db/sql');
const storyQueries = require('../../../db/selectors/story');
const AssignAction = require('../../../core/models/action/assign');
/**
 * @param {Array} stories - entries
 * @returns {Buffer}
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
 * @param {object} document - parameters
 * @param {object} passport - passport gotoisCredentions
 * @returns {Promise<*>}
 */
module.exports = async function (document, { marketplace, passport }) {
  logger.info('backup');
  try {
    const date = document.startTime;
    const tokenValue = document.subjectOf.find((subject) => {
      return subject.name === 'token';
    });
    const token = tokenValue.abstract;
    const sortingValue = document.subjectOf.find((subject) => {
      return subject.name === 'sorting';
    });
    const sorting = sortingValue.abstract;
    const { stories, user, storyJSON } = await pool.connect(
      async (connection) => {
        const botTable = await connection.one(
          passportQueries.selectByPassport(passport.passport_id),
        );
        // check 2fa - todo uncomment
        const valid = twoFactorAuthService.verifyUser(
          botTable.secret_key,
          token,
        );
        if (!valid) {
          throw new Error('Неверный ключ. Попробуйте снова');
        }
        const userTable = await connection.one(
          passportQueries.selectUserById(passport.passport_id),
        );
        const rows = await connection.many(
          storyQueries.selectPublisherStoryByDate({
            publisher: botTable.email,
            sorting,
          }),
        );
        return {
          stories: getTextFromStories(rows),
          botTable,
          user: userTable,
          storyJSON: JSON.stringify(rows),
        };
      },
    );
    const txtPack = await pack([
      {
        buffer: stories,
        filename: `backup_${date}.txt`,
      },
      {
        buffer: storyJSON,
        filename: `backup_${date}.json`,
      },
    ]);
    const result = {
      '@type': 'EmailMessage',
      'sender': document.agent,
      'toRecipient': {
        '@type': 'Person',
        'name': 'My User',
        'email': user.email,
      },
      'about': {
        '@type': 'Thing',
        'name': 'Backup ProstoDiary: Your story backup',
      },
      'name': 'Backup',
      'description': 'Данные успешно отправлены на почту ' + user.email,
      'messageAttachment': {
        '@type': 'CreativeWork',
        'name': 'backup.zip',
        'abstract': txtPack.toString('base64'),
        'encodingFormat': 'application/zip',
      },
    };
    commandLogger.info({
      document,
      passport,
      marketplace,
      result,
    });
    return Promise.resolve(
      AssignAction({
        agent: document.agent,
      }),
    );
  } catch (error) {
    return Promise.reject(this.error(400, error.message, error));
  }
};
