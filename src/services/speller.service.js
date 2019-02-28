const request = require('request');
const { replaceBetween } = require('./text.service');
/**
 * @param {string} text - text
 * @returns {Promise<Array>}
 */
const spellCheck = (text) => {
  // todo: use request.post
  return new Promise((resolve, reject) => {
    request(
      {
        url: 'https://speller.yandex.net/services/spellservice.json/checkText',
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        form: {
          format: 'plain',
          text: text,
        },
        json: true,
      },
      (error, response, body) => {
        if (error) {
          return reject(error);
        }
        if (!Array.isArray(body)) {
          return reject(body);
        }

        resolve(body);
      },
    );
  });
};
/**
 * Исправляем очевидные ошибки (рублкй -> рублей)
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
  spellCheck,
  spellText,
};
