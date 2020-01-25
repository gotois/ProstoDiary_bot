const { pool } = require('../../core/database');
const passportQueries = require('../../db/passport');
/**
 * @description блокировки чтения/приема и общей работы бота
 * @param {object} requestObject - requestObject
 * @param {object} passport - passport gotoisCredentions
 * @returns {Promise<string>}
 */
module.exports = async function(requestObject, { passport }) {
  const signOutResult = await pool.connect(async (connection) => {
    try {
      const botTable = await connection.one(
        passportQueries.selectByPassport(passport.id),
      );
      if (!botTable.activated) {
        return 'Бот уже был деактивирован';
      }
      // todo: деактивировать почтовый ящик https://yandex.ru/dev/pdd/doc/reference/email-edit-docpage/
      //  ...
      await connection.query(
        passportQueries.deactivateByPassportId(passport.id),
      );
      return 'Бот деактивирован';
    } catch (error) {
      return `Вход закончился ошибкой: ${error.message}`;
    }
  });
  return signOutResult;
};
