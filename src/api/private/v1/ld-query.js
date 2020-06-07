const jena = require('../../../lib/jena');
/**
 * @param {object} object - object
 * @param {string} object.query - sparql query
 * @returns {Promise<string|Error>}
 */
module.exports = async function ({ query }) {
  try {
    const { results } = await jena.query(query);
    // console.log(JSON.stringify(results, null, 2))
    return Promise.resolve(results);
  } catch (error) {
    return Promise.reject(this.error(400, error.message, error));
  }
};
