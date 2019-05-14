const { post } = require('./request.service');
const { replaceBetween } = require('./text.service');
/**
 * @constant
 * @type {string}
 */
const SPELLER_HOST = 'speller.yandex.net';
/**
 * @param {string} text - text
 * @returns {Promise<Array|Error>}
 */
const spellCheck = async (text) => {
  const res = await post(
    `https://${SPELLER_HOST}/services/spellservice.json/checkText`,
    {
      format: 'plain',
      text: text,
    },
  );
  if (!Array.isArray(res)) {
    throw new Error('spellCheck API changes' + res);
  }
  return res;
};
/**
 * Исправляем очевидные ошибки
 *
 * await spellText('рублкй') -> рублей
 *
 * @param {string} myText - user text
 * @returns {Promise<string>}
 */
const spellText = async (myText) => {
  let out = myText;
  const array = await spellCheck(myText);

  for (let a of array) {
    const [replacedWord] = a.s;
    out = replaceBetween(out, a.pos, a.pos + a.len, replacedWord);
  }

  return out;
};

module.exports = {
  spellText,
};
