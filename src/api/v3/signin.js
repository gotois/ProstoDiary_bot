const { pool } = require('../../core/database');
const botQueries = require('../../db/bot');
const twoFactorAuthService = require('../../services/2fa.service');
/**
 * @description Авторизация и разблокировка чтения/приема и общей работы бота
 * @param {object} requestObject - params
 * @param {string} requestObject.passportId - passport id
 * @param {string} requestObject.token - two auth generated token
 * @returns {Promise<string>}
 */
module.exports = async (requestObject) => {
  // email можно брать из запроса через basic auth
  const { passportId, token } = requestObject;
  if (!token) {
    throw new Error('Unknown token argument');
  }
  const signInResult = await pool.connect(async (connection) => {
    try {
      const botTable = await connection.one(
        botQueries.selectByPassport(passportId),
      );
      const valid = await twoFactorAuthService.verify(
        botTable.secret_key,
        token,
      );
      if (!valid) {
        // todo Превышено число попыток входа. Начните снова через N секунд
        //  ...
        throw new Error('Неверный ключ. Попробуйте снова');
      }
      if (botTable.activated) {
        return 'Бот уже был активирован';
      }
      await connection.query(botQueries.activateByPassportId(passportId));
      return 'Бот активирован';
    } catch (error) {
      return `Вход закончился ошибкой: ${error.message}`;
    }
  });
  return signInResult;
};
