const { Translate } = require('@google-cloud/translate');
const { GOOGLE } = require('../environment');
const client = new Translate({
  credentials: GOOGLE.CREDENTIALS,
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
