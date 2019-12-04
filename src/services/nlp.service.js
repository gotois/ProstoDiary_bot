const franc = require('franc');
const language = require('@google-cloud/language');
const { GOOGLE } = require('../environment');

const client = new language.LanguageServiceClient({
  credentials: GOOGLE.CREDENTIALS,
});
/**
 * @constant
 * @type {string}
 */
const ENCODING_TYPE_UTF8 = 'UTF8';
/**
 * @param {string} text - text
 * @param {string} [language] - language
 * @returns {{extractEntities: boolean, extractSyntax: boolean, extractDocumentSentiment: boolean, extractEntitySentiment: boolean, classifyText: boolean}}
 */
const features = (text, language) => {
  const rus = isRUS(language);
  // гипотеза - 100 достаточно чтобы считалось большим предлоением
  const classifyText = !rus && text.length > 100;
  const extractDocumentSentiment = !rus;
  const extractEntitySentiment = !rus;
  return {
    extractSyntax: true,
    extractEntities: true,
    extractDocumentSentiment, // не работает для русского текста
    extractEntitySentiment, // не работает для русского текста
    classifyText: classifyText, // TODO: работает только на больших предложениях
  };
};
/**
 *
 * @param {string} text - text
 * @param {string} [language] - language code
 * @returns {{language: *, type: string, content: *}}
 */
const document = (text, language) => {
  return {
    content: text,
    language: langISO(language),
    type: 'PLAIN_TEXT',
  };
};
/**
 * @description Detects the sentiment of the document
 * @param {string} text - text
 * @returns {Promise<object>}
 */
const analyzeSentiment = async (text) => {
  const [result] = await client.analyzeSentiment({
    document: document(text),
  });
  return result;
};
/**
 * @param {string} text - text
 * @returns {Promise<object>}
 */
const classifyText = async (text) => {
  const [classification] = await client.classifyText({
    document: document(text),
  });
  return classification;
};
/**
 * @param {string} text - text
 * @returns {Promise<object>}
 */
const analyzeEntitySentiment = async (text) => {
  const [result] = await client.analyzeEntitySentiment({
    document: document(text),
  });
  return result;
};
/**
 * @param {string} text - text
 * @returns {Promise<object>}
 */
const analyzeEntities = async (text) => {
  const [result] = await client.analyzeEntities({
    document: document(text),
  });
  return result;
};
/**
 * @param {string} text - text
 * @param {string} language - language
 * @returns {Promise<object>}
 */
const annotateText = async (text, language) => {
  const [result] = await client.annotateText({
    document: document(text, language),
    features: features(text, language),
    encodingType: ENCODING_TYPE_UTF8,
  });
  return result;
};
/**
 * @description The text to analyze
 * @param {string} text - string text
 * @returns {Promise<object>}
 */
const analyzeSyntax = async (text) => {
  const [syntax] = await client.analyzeSyntax({ document: document(text) });
  return syntax;
};
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
      // eslint-disable-next-line unicorn/regex-shorthand
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
// eslint-disable-next-line
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
  analyzeEntities,
  analyzeEntitySentiment,
  analyzeSentiment,
  analyzeSyntax,
  annotateText,
  classifyText,
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
