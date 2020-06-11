const { post } = require('./request');
/**
 * @constant
 * @type {string}
 */
const SPELLER_HOST = 'speller.yandex.net';
/**
 * @param {object} obj - object
 * @param {string} obj.text - Текст для проверки
 * @param {string} obj.lang - Языки проверки
 * @param {string} obj.format - Формат проверяемого текста
 * @param {number} obj.options - Опции Яндекс.Спеллера. Значением параметра является сумма значений требуемых опций
 * @returns {Promise<Array|ReferenceError>}
 */
module.exports = async ({
  text,
  lang = 'ru,en',
  options = 0,
  format = 'plain',
}) => {
  const result = await post(
    `https://${SPELLER_HOST}/services/spellservice.json/checkText`,
    {
      format,
      lang,
      text,
      options,
    },
  );
  if (!Array.isArray(result)) {
    throw new ReferenceError('spellCheck API changes');
  }
  return result;
};
