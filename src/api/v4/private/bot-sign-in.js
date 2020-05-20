const logger = require('../../../lib/log');
const { pool } = require('../../../db/sql');
const passportQueries = require('../../../db/selectors/passport');
// eslint-disable-next-line
const twoFactorAuthService = require('../../../services/2fa.service');

module.exports = async function ({ session }) {
  try {
    if (!session.passportId) {
      throw new Error('Session not found');
    }
    logger.info('signin', session.passportId);
    const passportId = session.passportId;
    await pool.connect(async (connection) => {
      const botTable = await connection.one(
        passportQueries.selectByPassport(passportId),
      );
      // Бот уже был деактивирован
      if (botTable.activated) {
        return;
      }
      /*
      const valid = twoFactorAuthService.verifyUser(passport.secret_key, token);
      if (!valid) {
        // todo Превышено число попыток входа. Начните снова через N секунд
        //  ...
      }
      */

      await connection.query(passportQueries.activateByPassportId(passportId));
    });

    return Promise.resolve('Бот активирован');
  } catch (error) {
    return Promise.reject(this.error(400, error.message, error));
  }
};
