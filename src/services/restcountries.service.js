const { get } = require('./request.service');
/**
 * @constant
 * @type {string}
 */
const RESTCOUNTRIES_HOST = 'restcountries.eu';
/**
 *
 * @param {string} name - text
 * @returns {Promise<Array<Object>|Error>}
 */
const getFullName = async (name) => {
  const encodeName = encodeURI(name);
  const restCountriesBuffer = await get(
    `https://${RESTCOUNTRIES_HOST}/rest/v2/name/${encodeName}?fullText=true`,
  );
  const restCountriesBufferData = restCountriesBuffer.toString('utf8');
  return JSON.parse(restCountriesBufferData);
};

module.exports = {
  getFullName,
};
