const crypt = require('../../services/crypt.service');
const dialogflowService = require('../../lib/dialogflow');
const { correctionText } = require('../../services/text.service');
const logger = require('../../services/logger.service');
const { FakerText } = require('../../services/faker.service');
const passportQueries = require('../../db/passport');
const { pool } = require('../../core/database');
/**
 * @description Генерация сообщения для почты
 * @param {object} requestObject - requestObject
 * @returns {Promise<object>}
 */
module.exports = async function(requestObject) {
  const {
    text,
    caption = 'unknown',
    passportId,
    categories = [],
  } = requestObject;
  let subject;
  // Автоматическое исправление опечаток
  const correction = await correctionText(text);
  const fakeText = FakerText.text(text);
  if (fakeText.length <= 256) {
    try {
      const dialogflowResult = await dialogflowService.detectTextIntent(
        fakeText,
      );
      subject = dialogflowResult.intent.displayName;
    } catch (error) {
      logger.error(error.message);
    }
  }
  const buffer = Buffer.from(correction);

  // todo Исправление кастомных типов
  //  найденных параметров (Например, "к" = "тысяча", преобразование кастомных типов "37C" = "37 Number Celsius")
  // ...
  //  ...
  const secretKey = await pool.connect(async (connection) => {
    const botTable = await connection.one(
      passportQueries.selectByPassport(passportId),
    );
    return botTable.secret_key;
  });
  const encrypted = await crypt.openpgpEncrypt(buffer, [secretKey]);
  return {
    mime: 'plain/text',
    subject: subject || caption,
    content: encrypted.data,
    original: text,
    categories: ['transaction-write'].concat(categories),
  };
};
