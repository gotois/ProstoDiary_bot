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
  const lang = franc(query, { whitelist: [RUS, ENG] });

  if (lang === UNDEFINED) {
    if (/[А-Я]/i.test(query)) {
      return RUS;
    } else if (/[А-Я]/i.test(query)) {
      return ENG;
    }
  }

  return lang;
};
/**
 * @param {string} query - query
 * @returns {string}
 */
const getLangCodeFromQuery = (query) => {
  return getLangCode(detectLang(query));
};
/**
 * @param {string} query - query
 * @returns {string}
 */
const getPostgresLangCode = (query) => {
  const langCode = detectLang(query);
  switch (langCode) {
    case RUS:
      return 'russian';
    case ENG:
      return 'english';
    default:
      return 'simple';
  }
};

module.exports = {
  detectLang,
  getLangCode,
  getLangCodeFromQuery,
  getPostgresLangCode,
  languages: {
    ENG,
    RUS,
    UNDEFINED,
  },
};
