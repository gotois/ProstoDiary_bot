const franc = require('franc');
/**
 * @constant
 * @type {string}
 */
const ENG = 'eng';
/**
 * @constant
 * @type {string}
 */
const RUS = 'rus';
/**
 * @param francCode {string}
 * @return {string}
 */
const getLangCode = (francCode) => {
  switch (francCode) {
    case RUS: {
      return 'ru';
    }
    default: {
      return 'en';
    }
  }
};
/**
 * @param query {string}
 * @return {string}
 */
const detectLang = (query) => {
  return franc(query, {whitelist: [ENG, RUS]});
};

module.exports = {
  detectLang,
  getLangCode,
};
