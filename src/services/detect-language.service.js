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
 * @description Получаю язык текста
 * @todo прямо эта функция будет возвращать все доступные коды для разных систем: posgresql, dialogflow, humanLang, etc
 * @param {string} query - query
 * @returns {object}
 */
const detectLang = (query) => {
  let langCode = franc(query, { whitelist: [RUS, ENG] });
  if (langCode === UNDEFINED) {
    if (/[А-Я]/i.test(query)) {
      langCode = RUS;
    } else if (/[A-Z]/i.test(query)) {
      langCode = ENG;
    }
  }
  return {
    language: langCode,
    dialogflow: getDialogFlowLangCodeFromQuery(langCode),
    postgresql: getPostgresLangCode(langCode),
  };
};
/**
 * @param {string} langCode - query
 * @returns {string}
 */
const getDialogFlowLangCodeFromQuery = (langCode) => {
  switch (langCode) {
    case RUS: {
      return 'ru';
    }
    default: {
      return 'en';
    }
  }
};
/**
 * @param {string} langCode - query
 * @returns {string}
 */
const getPostgresLangCode = (langCode) => {
  switch (langCode) {
    case RUS:
      return 'russian';
    case ENG:
      return 'english';
    default:
      return 'simple';
  }
};
/**
 * @param {string} languageCode - lang
 * @returns {boolean}
 */
const isRUS = (languageCode) => {
  return /ru/.test(languageCode);
};
/**
 * @param  {string} languageCode - lang
 * @returns {boolean}
 */
const isENG = (languageCode) => {
  return /en/.test(languageCode);
};
/**
 * rus -> ru; eng -> en
 *
 * @param {string|undefined} language - lang
 * @returns {undefined|string}
 */
const langISO = (language) => {
  if (!language) {
    return undefined;
  }
  return language.slice(0, 2);
};

module.exports = {
  detectLang,
  isRUS,
  isENG,
  langISO,
  languages: {
    ENG,
    RUS,
    UNDEFINED,
  },
};
