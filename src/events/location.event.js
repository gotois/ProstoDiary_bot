const bot = require('../bot');
const logger = require('../services/logger.service');
const { getFullName } = require('../services/restcountries.service');
const { getGeoCode } = require('../services/geocode.service');
const { getWeather } = require('../services/weather.service');
/**
 * @param {Array} parsedData - geocode parsed data
 * @returns {Error|string}
 */
const getLocShortName = (parsedData) => {
  const resultLength = parsedData.length;
  if (!resultLength) {
    logger.log('error', 'No results');
    throw Error('No results');
  }
  // TODO: без try/catch
  try {
    return parsedData[resultLength - 1].address_components[0].short_name;
  } catch (error) {
    logger.log('error', 'No address_components');
    throw Error('No address_components');
  }
};
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
 * @param {object} msg - message
 * @param {object} msg.chat - chat
 * @param {object} msg.location - location
 * @returns {undefined}
 */
const onLocation = async ({ chat, location: { latitude, longitude } }) => {
  logger.log('info', onLocation.name);
  const chatId = chat.id;
  let formattedAddress;
  let currencySymbol;
  let currencyCode;
  let weatherDescription;
  try {
    const addressInfo = await getAddress({ latitude, longitude });
    formattedAddress = addressInfo.formattedAddress;
    currencySymbol = addressInfo.currency.symbol;
    currencyCode = addressInfo.currency.code;
  } catch (error) {
    logger.log('error', error.toString());
  }
  try {
    const weatherInfo = await getWeather({ latitude, longitude });
    weatherDescription = weatherInfo.description;
  } catch (error) {
    logger.log('error', error.toString());
  }
  await bot.sendMessage(
    chatId,
    `${formattedAddress} ; валюта: ${currencySymbol} ; code: ${currencyCode} ; погода: ${weatherDescription}`,
    {},
  );
};

module.exports = onLocation;
