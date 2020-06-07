const jena = require('../../../lib/jena');
/**
 * @returns {Promise<string|Error>}
 */
module.exports = async function ({ document }) {
  try {
    // hack переопределяем контекст для правильного распознавания JENA
    if (document['@context'] == 'https://schema.org') {
      document['@context'] = 'https://schema.org/docs/jsonldcontext.json';
    }
    const string = JSON.stringify(document, null, 2);
    const bufferObject = Buffer.from(string);
    await jena.upload(bufferObject);
    return Promise.resolve('true');
  } catch (error) {
    return Promise.reject(this.error(400, error.message, error));
  }
};
