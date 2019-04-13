const { Translate } = require('@google-cloud/translate');
const { GOOGLE } = require('../env');
const client = new Translate({
  credentials: GOOGLE.GOOGLE_CREDENTIALS_PARSED,
});
/**
 * Translates some text into targetLang
 *
 * @param {string} text - The text to translate
 * @param {string} targetLang - The target language
 * @returns {Promise<string>}
 */
const translate = async (text, targetLang) => {
  const [translation] = await client.translate(text, targetLang);
  return translation;
};

module.exports = {
  translate,
};
