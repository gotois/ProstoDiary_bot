const jsonrpc = require('jsonrpc-lite');
const bot = require('../core/bot');
const logger = require('../services/logger.service');
const locationAPI = require('../api/v2/location');
const TelegramBotRequest = require('./telegram-bot-request');

class Location extends TelegramBotRequest {
  constructor(message) {
    super(message);
    this.api = locationAPI;
  }
  async beginDialog() {
    logger.log('info', Location.name);
    const { latitude, longitude } = this.message.location;
    const requestObject = jsonrpc.request('123', 'location', {
      latitude,
      longitude,
    });
    const locationResult = await this.request(requestObject);
    // todo: сохранять это в историю
    await bot.sendMessage(this.message.chat.id, locationResult, {});
  }
}
/**
 * @param {TelegramMessage} message - message
 * @returns {Promise<undefined>}
 */
const onLocation = async (message) => {
  const location = new Location(message);
  await location.beginDialog();
};

module.exports = onLocation;
