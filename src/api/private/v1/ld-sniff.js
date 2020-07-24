const crawler = require('../../../lib/crawler');
/**
 * @param {object} root - object
 * @param {string} root.url - url
 * @param {string} [root.auth] - auth
 * @returns {Promise<string|Error>}
 */
module.exports = async function ({ url, auth }) {
  try {
    const documentMap = await crawler({ url, auth });
    return Promise.resolve(documentMap);
  } catch (error) {
    return Promise.reject(this.error(400, error.message, error));
  }
};
