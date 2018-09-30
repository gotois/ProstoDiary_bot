const logger = require('./logger.service');
const {get} = require('./request.service');
/**
 *
 * @param name {string}
 * @return {Promise<any|*>}
 */
const getFullName = async (name) => {
  let encodeName;
  try {
    encodeName = encodeURI(name);
  } catch (error) {
    logger.log('error', error.toString());
    throw new Error(error);
  }
  return await get(`https://restcountries.eu/rest/v2/name/${encodeName}?fullText=true`);
};

module.exports = {
  getFullName,
};
