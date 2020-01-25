const { pool } = require('../../core/database');
const { pack } = require('../../services/archive.service');
const twoFactorAuthService = require('../../services/2fa.service');
const storyQueries = require('../../db/story');
const { convertIn2DigitFormat } = require('../../services/date.service');
const passportQueries = require('../../db/passport');
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
 * @description backup
 * @param {object} requestObject - requestObject
 * @param {object} passport - passport gotoisCredentions
 * @returns {Promise<string>}
 */
module.exports = async function(requestObject, { passport }) {
  const { date, token, sorting = 'ASC' } = requestObject;
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
  // пример вызова API метода из другого
  try {
    await this._methods.notify.handler(
      {
        provider: 'mailto',
        subject: 'Backup ProstoDiary',
        html: `
      <h1>Your story backup</h1>
    `,
        attachments: [
          {
            content: txtPack.toString('base64'),
            filename: 'backup.zip',
            type: 'application/zip',
            disposition: 'attachment',
          },
        ],
      },
      { passport },
    );
    return 'Данные успешно отправлены на вашу почту';
  } catch (error) {
    return Promise.reject(this.error(400, error.message));
  }
};
