const crawler = require('../../../lib/crawler');
/**
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
