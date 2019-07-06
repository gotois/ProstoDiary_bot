const { GOOGLE } = require('../env');
const language = require('@google-cloud/language');

const client = new language.LanguageServiceClient({
  credentials: GOOGLE.GOOGLE_CREDENTIALS_PARSED,
});

const features = (text, language) => {
  const isRUS = /ru/.test(language);
  // гипотеза - 100 достаточно чтобы считалось большим предлоением
  const classifyText = text.length > 100 ? true : false;
  return {
    extractSyntax: true,
    extractEntities: true,
    extractDocumentSentiment: isRUS ? false : true, // не работает для русского текста
    extractEntitySentiment: isRUS ? false : true, // не работает для русского текста
    classifyText: classifyText, // TODO: работает только на больших предложениях
  };
};

const encodingType = 'UTF8';

const document = (text, language) => {
  return {
    content: text,
    language: language.slice(0, 2), // rus -> ru; eng -> en
    type: 'PLAIN_TEXT',
  };
};

// Detects the sentiment of the document
const analyzeSentiment = async (text) => {
  const [result] = await client.analyzeSentiment({
    document: document(text, language),
  });
  return result;
};

const classifyText = async (text) => {
  const [classification] = await client.classifyText({
    document: document(text, language),
  });
  return classification;
};

const analyzeEntitySentiment = async (text) => {
  const [result] = await client.analyzeEntitySentiment({
    document: document(text, language),
  });
  return result;
};
/**
 * @param {string} text - text
 * @returns {Promise<object>}
 */
const analyzeEntities = async (text) => {
  const [result] = await client.analyzeEntities({
    document: document(text, language),
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
    encodingType: encodingType,
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
