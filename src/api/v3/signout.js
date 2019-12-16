const { pool } = require('../../core/database');
const passportQueries = require('../../db/passport');
/**
 * @description блокировки чтения/приема и общей работы бота
 * @param {object} requestObject - requestObject
 * @returns {Promise<string>}
 */
module.exports = async function(requestObject) {
  const { passportId } = requestObject;
  const signOutResult = await pool.connect(async (connection) => {
    try {
      const botTable = await connection.one(
        passportQueries.selectByPassport(passportId),
      );
      if (!botTable.activated) {
        return 'Бот уже был деактивирован';
      }
      // todo: деактивировать почтовый ящик https://yandex.ru/dev/pdd/doc/reference/email-edit-docpage/
      //  ...
      await connection.query(
        passportQueries.deactivateByPassportId(passportId),
      );
      return 'Бот деактивирован';
    } catch (error) {
      return `Вход закончился ошибкой: ${error.message}`;
    }
  });
  return signOutResult;
};
