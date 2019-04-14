const { get } = require('./request.service');
/**
 * @constant
 * @type {string}
 */
const RESTCOUNTRIES_HOST = 'restcountries.eu';
/**
 * @param {string} name - text
 * @returns {Promise<Array<Object>|Error>}
 */
const getFullName = async (name) => {
  const encodeName = encodeURI(name);
  const restCountriesBuffer = await get(
    `https://${RESTCOUNTRIES_HOST}/rest/v2/name/${encodeName}?fullText=true`,
  );
  const restCountriesBufferData = restCountriesBuffer.toString('utf8');
  const parsedRestCountries = JSON.parse(restCountriesBufferData);
  if (!Array.isArray(parsedRestCountries)) {
    throw new Error('GEO: country not found');
  }
  return parsedRestCountries;
};

module.exports = {
  getFullName,
};
