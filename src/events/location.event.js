const bot = require('../config/index');
const logger = require('../services/logger.service');
const {getFullName} = require('../services/restcountries.service');
const {getGeoCode} = require('../services/geocode.service');
/**
 * @param {Object} msg - message
 * @param {Object} msg.chat - chat
 * @param {Object} msg.location - location
 * @returns {undefined}
 */
const onLocation = async ({ chat, location: { latitude, longitude } }) => {
  logger.log('info', onLocation.name);
  const chatId = chat.id;
  const parsedData = await getGeoCode({ latitude, longitude });
  if (!Array.isArray(parsedData.results)) {
    await bot.sendMessage(chatId, 'Геокод не найден', {});
    return;
  }
  /**
   * @param {Object} parsedData - geocode parsed data
   * @returns {*}
   */
  const getLocShortName = (parsedData) => {
    const resultLength = parsedData.results.length;
    if (!resultLength) {
      logger.log('error', 'No results');
      throw Error('No results');
    }
    try {
      if (parsedData.results[resultLength - 1]) {
        return parsedData.results[resultLength - 1].address_components[0].short_name;
      }
    } catch (error) {
      logger.log('error', 'No address_components');
      throw Error('No address_components');
    }
  };
  const locShortName = getLocShortName(parsedData);
  const formattedAddress = parsedData.results[0].formatted_address;
  const parsedRestCountries = await getFullName(locShortName);
  if (!Array.isArray(parsedRestCountries)) {
    await bot.sendMessage(chatId, 'Значение страны не найдено', {});
    return;
  }
  const currency = parsedRestCountries[0].currencies[0];
  await bot.sendMessage(chatId, formattedAddress +
    ' ; валюта: ' + currency.symbol +
    ' ; code: ' + currency.code, {});
};

module.exports = onLocation;
