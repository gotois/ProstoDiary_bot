// yandex dictionary
const { get } = require('../services/request.service');
const { YANDEX } = require('../environment');
/**
 * @constant
 * @type {string}
 */
const DICTIONARY_HOST = 'dictionary.yandex.net';
/**
 * @param {object} obj - object
 * @param {string} obj.text - Текст для проверки
 */
module.exports = async ({ text, lang = 'en-ru' }) => {
  const result = await get(
    `https://${DICTIONARY_HOST}/api/v1/dicservice.json/lookup`,
    {
      key: YANDEX.YA_DICTIONARY,
      lang,
      text: encodeURIComponent(text),
    },
    null,
    'utf8',
  );
  return result;
};
