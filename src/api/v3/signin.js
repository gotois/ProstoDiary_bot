const { pool } = require('../../core/database');
const passportQueries = require('../../db/passport');
const botQueries = require('../../db/bot');
const twoFactorAuthService = require('../../services/2fa.service');
/**
 * @description Авторизация и разблокировка чтения/приема и общей работы бота
 * @param {object} requestObject - params
 * @param {string} requestObject.token - two auth generated token
 * @param {?string} requestObject.telegram - telegram id
 * @returns {Promise<string>}
 */
module.exports = async (requestObject) => {
  // email можно брать из запроса через basic auth
  const { telegram = -1, token } = requestObject;
  if (!token) {
    throw new Error('Unknown token argument');
  }

  // 1 - связка (telegram|email) + password
  // 2 - связка (telegram|email) + token
  // todo в зависимости от связки возващается стандартный passport или расширенный
  const signInResult = await pool.connect(async (connection) => {
    try {
      const passportTable = await connection.one(
        passportQueries.selectAll(telegram),
      );
      const botTable = await connection.one(
        botQueries.selectByPassport(passportTable.id),
      );
      const valid = await twoFactorAuthService.verify(
        botTable.secret_key,
        token,
      );
      if (!valid) {
        // todo делать фолбэк транзакций на инсталляцию делать большой таймаут
        //  ...
        // `Превышено число попыток входа. Начните снова через N секунд
        throw new Error('Неверный ключ. Попробуйте снова');
      }
      if (!botTable.activated) {
        await connection.query(
          botQueries.activateByPassportId(botTable.passport_id),
        );
      }
      return 'Бот активирован';
    } catch (error) {
      return `Вход закончился ошибкой: ${error.message}`;
    }
  });
  return signInResult;
};
