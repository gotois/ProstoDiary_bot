const bot = require('../config/index');
const {get} = require('../services/request.service');
const logger = require('../services/logger.service');
const {getFullName} = require('../services/restcountries.service');
const {GOOGLE_MAPS_GEOCODING_API} = require('../env');
/**
 * @param msg {Object}
 * @param msg.chat {Object}
 * @param msg.location {Object}
 * @return {void}
 */
const onLocation = async ({chat, location: {latitude, longitude}}) => {
  logger.log('info', onLocation.name);
  const googleServiceAPI = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_GEOCODING_API}`;
  const googleMapBuffer = await get(googleServiceAPI);
  const googleMapBufferData = googleMapBuffer.toString('utf8');
  const chatId = chat.id;
  
  let formattedAddress = '';
  let locShortName = null;
  try {
    const parsedData = JSON.parse(googleMapBufferData);
    if (parsedData.results.length) {
      locShortName = parsedData.results[parsedData.results.length - 1].address_components[0].short_name;
      formattedAddress = parsedData.results[0].formatted_address;
    }
  } catch (error) {
    logger.log('error', error.toString());
    await bot.sendMessage(chatId, error.toString());
    return;
  }
  if (!locShortName) {
    await bot.sendMessage(chatId, 'Ничего не найдено', {});
    return;
  }
  const restCountriesBuffer = await getFullName(locShortName);
  const restCountriesBufferData = restCountriesBuffer.toString('utf8');
  const parsedRestCountries = JSON.parse(restCountriesBufferData);
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
