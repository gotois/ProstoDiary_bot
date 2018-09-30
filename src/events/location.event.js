const bot = require('../config/index');
const logger = require('../services/logger.service');
const {getFullName} = require('../services/restcountries.service');
const {getGeoCode} = require('../services/geocode.service');
/**
 * @param msg {Object}
 * @param msg.chat {Object}
 * @param msg.location {Object}
 * @returns {undefined}
 */
const onLocation = async ({chat, location: {latitude, longitude}}) => {
  logger.log('info', onLocation.name);
  const chatId = chat.id;
  const parsedData = await getGeoCode({latitude, longitude});
  if (!Array.isArray(parsedData.results)) {
    await bot.sendMessage(chatId, 'Геокод не найден', {});
    return;
  }
  const locShortName = parsedData.results[parsedData.results.length - 1].address_components[0].short_name;
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
