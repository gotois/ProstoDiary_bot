const logger = require('./logger.service');
const { get } = require('./request.service');
/**
 *
 * @param {string} name - text
 * @returns {Promise<Array<Object>|Error>}
 */
const getFullName = async (name) => {
  try {
    const encodeName = encodeURI(name);
    const restCountriesBuffer = await get(
      `https://restcountries.eu/rest/v2/name/${encodeName}?fullText=true`,
    );
    const restCountriesBufferData = restCountriesBuffer.toString('utf8');
    return JSON.parse(restCountriesBufferData);
  } catch (error) {
    logger.log('error', error.toString());
    throw new Error(error);
  }
};

module.exports = {
  getFullName,
};
