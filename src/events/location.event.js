const bot = require('../config/index.js');
const {get} = require('../services/request.service');
const logger = require('../services/logger.service');
const {GOOGLE_MAPS_GEOCODING_API} = process.env;
/**
 * @param msg {Object}
 * @param msg.chat {Object}
 * @param msg.location {Object}
 * @return {void}
 */
const onLocation = async ({chat, location: {latitude, longitude}}) => {
  const googleServiceAPI = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_GEOCODING_API}`;
  const buffer = await get(googleServiceAPI);
  const bufferData = buffer.toString('utf8');
  const chatId = chat.id;
  
  let formattedAddress = '';
  try {
    formattedAddress = JSON.parse(bufferData).results[0].formatted_address;
  } catch (error) {
    logger.log('error', error.toString());
    await bot.sendMessage(chatId, error.toString());
    return;
  }
  
  await bot.sendMessage(chatId, formattedAddress, {});
};

module.exports = onLocation;
