const logger = require('../../lib/log');
const passportQueries = require('../../db/selectors/passport');
const { pack } = require('../../services/archive.service');
const twoFactorAuthService = require('../../services/2fa.service');
const commandLogger = require('../../services/command-logger.service');
const { convertIn2DigitFormat } = require('../../services/date.service');
const { pool } = require('../../db/sql');
const storyQueries = require('../../db/selectors/story');
const RejectAction = require('../../core/models/action/reject');
const AcceptAction = require('../../core/models/action/accept');
const AcceptEmailAction = require('../../core/models/action/accept-email');
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
 * @param {object} document - parameters
 * @param {object} passport - passport gotoisCredentions
 * @returns {Promise<*>}
 */
module.exports = async function (document, { passport }) {
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
          storyQueries.selectStoryByDate({
            publisherEmail: botTable.email,
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
    const emailAction = AcceptEmailAction({
      sender: document.agent,
      toRecipient: {
        '@type': 'Person',
        'name': 'My User',
        'email': user.email,
      },
      about: {
        '@type': 'Thing',
        'name': 'Backup ProstoDiary: Your story backup',
      },
      messageAttachment: {
        '@type': 'CreativeWork',
        'name': 'backup.zip',
        'abstract': txtPack.toString('base64'),
        'encodingFormat': 'application/zip',
      },
    });
    commandLogger.info({
      document: {
        ...document,
        ...emailAction,
      },
      passport,
    });
    const resultAction = AcceptAction({
      abstract: 'Данные успешно отправлены на почту ' + user.email,
    });
    return Promise.resolve(resultAction);
  } catch (error) {
    return Promise.reject(
      this.error(400, null, JSON.stringify(RejectAction(error))),
    );
  }
};
