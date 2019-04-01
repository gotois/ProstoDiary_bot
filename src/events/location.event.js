const bot = require('../bot');
const logger = require('../services/logger.service');
const { getFullName } = require('../services/restcountries.service');
const { getGeoCode } = require('../services/geocode.service');
const { getWeather } = require('../services/weather.service');
/**
 * @param {Object} parsedData - geocode parsed data
 * @returns {Error|string}
 */
const getLocShortName = (parsedData) => {
  const resultLength = parsedData.results.length;
  if (!resultLength) {
    logger.log('error', 'No results');
    throw Error('No results');
  }
  try {
    if (parsedData.results[resultLength - 1]) {
      return parsedData.results[resultLength - 1].address_components[0]
        .short_name;
    }
  } catch (error) {
    logger.log('error', 'No address_components');
    throw Error('No address_components');
  }
};
/**
 * @param {number} latitude - lat
 * @param {number} longitude - lng
 * @returns {Promise<{formattedAddress: {string}, currency: {code: {string}, symbol: {string}}}>}
 */
const getAddress = async ({ latitude, longitude }) => {
  const parsedData = await getGeoCode({ latitude, longitude });
  if (!parsedData || !Array.isArray(parsedData.results)) {
    throw new Error('Геокод не найден');
  }
  const formattedAddress = parsedData.results[0].formatted_address;
  const locShortName = getLocShortName(parsedData);
  const parsedRestCountries = await getFullName(locShortName);
  if (!Array.isArray(parsedRestCountries)) {
    throw new Error('Значение страны не найдено');
  }
  const [currency] = parsedRestCountries[0].currencies;
  return {
    formattedAddress,
    currency,
  };
};
/**
 * @param {Object} msg - message
 * @param {Object} msg.chat - chat
 * @param {Object} msg.location - location
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
