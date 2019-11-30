const { pool } = require('../../core/database');
const botQueries = require('../../db/bot');
/**
 * @description блокировки чтения/приема и общей работы бота
 * @param {object} requestObject - requestObject
 * @returns {Promise<void>}
 */
module.exports = async (requestObject) => {
  const { passportId } = requestObject;
  const signOutResult = await pool.connect(async (connection) => {
    try {
      const botTable = await connection.one(
        botQueries.selectByPassport(passportId),
      );
      if (!botTable.activated) {
        return 'Бот уже был деактивирован';
      }
      // todo: деактивировать почтовый ящик
      //  https://yandex.ru/dev/pdd/doc/reference/email-edit-docpage/
      await connection.query(
        botQueries.deactivateByPassportId(passportId),
      );
      return 'Бот деактивирован';
    } catch (error) {
      return `Вход закончился ошибкой: ${error.message}`;
    }
  });
  return signOutResult;
};
