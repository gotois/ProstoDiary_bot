const bot = require('../bot');
const logger = require('../services/logger.service');
const locationAPI = require('../api/v1/location');
/**
 * @param {object} msg - message
 * @param {object} msg.chat - chat
 * @param {object} msg.location - location
 * @returns {undefined}
 */
const onLocation = async ({ chat, location: { latitude, longitude } }) => {
  logger.log('info', onLocation.name);
  const chatId = chat.id;
  try {
    const locationResult = await locationAPI({ latitude, longitude });
    await bot.sendMessage(chatId, locationResult, {});
  } catch (error) {
    logger.log('error', error);
  }
};

module.exports = onLocation;
