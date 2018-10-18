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
 * @constant
 * @type {string}
 */
const UNDEFINED = 'und';
/**
 * @param {string} francCode - code
 * @returns {string}
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
 * @param {string} query - query
 * @returns {string}
 */
const detectLang = (query) => {
  const lang = franc(query, {whitelist: [RUS, ENG]});
  
  if (lang === UNDEFINED) {
    if (/[А-Я]/i.test(query)) {
      return RUS;
    } else if (/[А-Я]/i.test(query)) {
      return ENG;
    }
  }
  
  return lang;
};

module.exports = {
  detectLang,
  getLangCode,
  languages: {
    ENG,
    RUS,
    UNDEFINED,
  }
};
