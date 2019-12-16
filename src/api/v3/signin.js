const { pool } = require('../../core/database');
const passportQueries = require('../../db/passport');
const logger = require('../../services/logger.service');
const twoFactorAuthService = require('../../services/2fa.service');
/**
 * @description Авторизация и разблокировка чтения/приема и общей работы бота
 * @param {object} requestObject - params
 * @param {string} requestObject.passportId - passport id
 * @param {string} requestObject.token - two auth generated token
 * @returns {Promise<string>}
 */
module.exports = async function(requestObject) {
  const { passportId, token } = requestObject;
  if (!token) {
    return Promise.reject(this.error(400, 'Unknown token argument'));
  }
  const signInResult = await pool.connect(async (connection) => {
    try {
      const botTable = await connection.one(
        passportQueries.selectByPassport(passportId),
      );
      const valid = twoFactorAuthService.verifyUser(botTable.secret_key, token);
      if (!valid) {
        // todo Превышено число попыток входа. Начните снова через N секунд
        //  ...
        throw new Error('Неверный ключ. Попробуйте снова');
      }
      if (botTable.activated) {
        return 'Бот уже был активирован';
      }
      await connection.query(passportQueries.activateByPassportId(passportId));
      return 'Бот активирован';
    } catch (error) {
      logger.error(error.message);
      throw error;
    }
  });
  return signInResult;
};
