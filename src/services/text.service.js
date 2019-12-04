const { post } = require('./request.service');
const { replaceBetween } = require('./string.service');
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
const spellCheck = async ({
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
/**
 * Исправляем очевидные ошибки
 *
 * await spellText('рублкй') -> рублей
 * Важно! Данные берутся относительно текущего месторасположения, включая VPN
 *
 * @param {string} text - user text
 * @param {string} [lang] - text language
 * @returns {Promise<string>}
 */
const spellText = async (text, lang) => {
  if (!text) {
    throw new Error('Text is undefined');
  }
  let out = text;
  const array = await spellCheck({
    text,
    lang,
  });

  for (const a of array) {
    const [replacedWord] = a.s;
    out = replaceBetween(out, a.pos, a.pos + a.len, replacedWord);
  }

  return out;
};

module.exports = {
  spellText,
};
