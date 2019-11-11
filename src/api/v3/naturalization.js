// поиск тела письма -> натурализация и сведение фактов в Истории -> оптимизация БД

const { getWeather } = require('../../services/weather.service');
const { getFullName } = require('../../services/restcountries.service');
const { getGeoCode } = require('../../services/geocode.service');
const logger = require('../../services/logger.service');
/**
 * @param {object} obj - lng
 * @param {number} obj.latitude - lat
 * @param {number} obj.longitude - lng
 * @returns {Promise<{formattedAddress: {string}, currency: {code: {string}, symbol: {string}}}>}
 */
const getAddress = async ({ latitude, longitude }) => {
  const parsedDataResults = await getGeoCode({ latitude, longitude });
  const formattedAddress = parsedDataResults[0].formatted_address;
  const locShortName = getLocShortName(parsedDataResults);
  const parsedRestCountries = await getFullName(locShortName);
  const [currency] = parsedRestCountries[0].currencies;
  return {
    formattedAddress,
    currency,
  };
};
/**
 * @param {Array} parsedData - geocode parsed data
 * @returns {Error|string}
 */
const getLocShortName = (parsedData) => {
  const resultLength = parsedData.length;
  if (!resultLength) {
    throw new Error('No results');
  }
  return parsedData[resultLength - 1].address_components[0].short_name;
};
/**
 * @param {RequestObject} requestObject - requestObject
 * @returns {JsonRpc|JsonRpcError}
 */
module.exports = async (requestObject) => {
  const { location } = requestObject.params;
  let formattedAddress;
  let currencySymbol;
  let currencyCode;
  let weatherDescription;
  try {
    const addressInfo = await getAddress(location);
    formattedAddress = addressInfo.formattedAddress;
    currencySymbol = addressInfo.currency.symbol;
    currencyCode = addressInfo.currency.code;
  } catch (error) {
    logger.log(error);
  }
  try {
    const weatherInfo = await getWeather(location);
    weatherDescription = weatherInfo.description;
  } catch (error) {
    logger.log(error);
  }
  return `${formattedAddress} ; валюта: ${currencySymbol} ; code: ${currencyCode} ; погода: ${weatherDescription}`;
};
