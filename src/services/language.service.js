const { GOOGLE } = require('../environment');
const language = require('@google-cloud/language');
const { isRUS, langISO } = require('./detect-language.service');

const client = new language.LanguageServiceClient({
  credentials: GOOGLE.GOOGLE_CREDENTIALS_PARSED,
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

module.exports = {
  analyzeEntities,
  analyzeEntitySentiment,
  analyzeSentiment,
  analyzeSyntax,
  annotateText,
  classifyText,
};
