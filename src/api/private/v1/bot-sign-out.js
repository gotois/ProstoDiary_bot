const logger = require('../../../lib/log');
const { pool } = require('../../../db/sql');
const passportQueries = require('../../../db/selectors/passport');

module.exports = async function ({ session }) {
  try {
    if (!session.passportId) {
      throw new Error('Session not found');
    }
    logger.info('signout', session.passportId);
    const passportId = session.passportId;
    await pool.connect(async (connection) => {
      const botTable = await connection.one(
        passportQueries.selectByPassport(passportId),
      );
      // Бот уже был деактивирован
      if (!botTable.activated) {
        return;
      }
      // todo: деактивировать почтовый ящик https://yandex.ru/dev/pdd/doc/reference/email-edit-docpage/
      //  ...
      await connection.query(
        passportQueries.deactivateByPassportId(passportId),
      );
    });

    return Promise.resolve('Бот деактивирован');
  } catch (error) {
    return Promise.reject(this.error(400, error.message, error));
  }
};
