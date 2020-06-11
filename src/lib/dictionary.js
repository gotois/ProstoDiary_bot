const { get } = require('./request');
const { YANDEX } = require('../environment');
/**
 * @constant
 * @type {string}
 */
const DICTIONARY_HOST = 'dictionary.yandex.net';
/**
 * Yandex dictionary
 *
 * @param {object} obj - object
 * @param {string} obj.text - Текст для проверки
 * @returns {Promise<object>}
 */
function dictionary({ text, lang = 'en-ru' }) {
  return get(
    `https://${DICTIONARY_HOST}/api/v1/dicservice.json/lookup`,
    {
      key: YANDEX.YA_DICTIONARY,
      lang,
      text: encodeURIComponent(text),
    },
    null,
    'utf8',
  );
}

async function getSynonyms(name) {
  const synonyms = [];
  const { def } = await dictionary({
    text: name,
    lang: 'ru-ru',
  });
  if (Array.isArray(def)) {
    for (const d of def) {
      synonyms.push(d.tr[0].text);
      if (Array.isArray(d.tr[0].syn)) {
        d.tr[0].syn.forEach((syn) => {
          synonyms.push(syn.text);
        });
      }
    }
  }
  return synonyms;
}

module.exports = {
  dictionary,
  getSynonyms,
};
