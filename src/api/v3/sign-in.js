const { sql, pool } = require('../../core/database');
const auth = require('../../services/auth.service');
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
      // todo: поддержать `... telegram = ${telegram} OR email = ${email}`
      const passport = await connection.one(sql`SELECT
    *
FROM
    passport
WHERE
    telegram = ${telegram}
`);
      const botPassport = await connection.one(sql`SELECT
    *
FROM
    bot
WHERE
    passport_id = ${passport.id}
`);
      const valid = await auth.verify(botPassport.secret_key, token);
      if (!valid) {
        // todo делать фолбэк транзакций на инсталляцию делать большой таймаут
        //  ...
        // `Превышено число попыток входа. Начните снова через N секунд
        throw new Error('Неверный ключ. Попробуйте снова');
      }
      if (!botPassport.activated) {
        await connection.query(sql`UPDATE
    bot
SET
    activated = ${true}
WHERE
    passport_id = ${botPassport.passport_id}
`);
      }
      return 'Бот включен';
    } catch (error) {
      return `Вход закончился ошибкой: ${error.message}`;
    }
  });
  return signInResult;
};
