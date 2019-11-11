const { sql, pool } = require('../../core/database');
const auth = require('../../services/auth.service');
/**
 * Авторизация
 *
 * @description разблокировка чтения/приема и общей работы бота
 * @param {object} requestObject - params
 * @param {?string} requestObject.telegram - telegram id
 * @param {?string} requestObject.token - two auth token
 * @param {?string} requestObject.email - email login
 * @returns {Promise<*>}
 */
module.exports = async (requestObject) => {
  const { telegram = -1, email = '', token = '' } = requestObject;
  // 1 - связка (telegram|email) + password
  // 2 - связка (telegram|email) + token
  // в зависимости от связки возващается стандартный passport или расширенный
  const signInResult = await pool.connect(async (connection) => {
    try {
      const passport = await connection.one(sql`
        SELECT * FROM passport
        WHERE telegram = ${telegram} OR email = crypt(${email}, email)
      `);
      if (token) {
        const valid = await auth.verify(passport.secret, token);
        if (!valid) {
          // todo делать фолбэк транзакций на инсталляцию, то есть удалять чужой паспорт или делать большой таймаут
          //  ...
          // `Превышено число попыток входа. Начните снова /start`
          throw new Error('Неверный ключ. Попробуйте снова');
        }
        if (!passport.activated) {
          await connection.query(sql`
            UPDATE passport
            SET activated = ${true}
            WHERE id = ${passport.id}
          `);
          return 'Активация завершена. Бот включен.';
        }
      }
    } catch (error) {
      return `Вход закончился ошибкой: ${error}`;
    }
  });
  return signInResult;
};
