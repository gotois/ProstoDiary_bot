const { get } = require('./request.service');
/**
 * @constant
 * @type {string}
 */
const RESTCOUNTRIES_HOST = 'restcountries.eu';
/**
 * @param {string} name - text
 * @returns {Promise<Array<object>|Error>}
 */
const getFullName = async (name) => {
  const encodeName = encodeURI(name);
  const parsedRestCountries = await get(
    `https://${RESTCOUNTRIES_HOST}/rest/v2/name/${encodeName}`,
    {
      fullText: true,
    },
  );
  if (!Array.isArray(parsedRestCountries)) {
    throw new ReferenceError('GEO: country not found');
  }
  return parsedRestCountries;
};

module.exports = {
  getFullName,
};
