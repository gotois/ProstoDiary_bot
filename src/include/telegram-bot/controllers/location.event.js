const TelegramBotRequest = require('./telegram-bot-request');
const TelegramMessage = require('../models/telegram-bot-message');
const {AbstractGeo} = require('vzor');

class Location extends TelegramBotRequest {
  constructor(message) {
    super(message);
    this.method = 'insert';
  }
  async beginDialog(silent) {
    await super.beginDialog(silent);
    const { latitude, longitude } = this.message.location;

    const locationAction = new AbstractGeo({
      latitude, longitude
    });

    const jsonldRequest = await locationAction({
      latitude,
      longitude,
      date: this.message.date,
      creator: this.creator,
      publisher: this.publisher,
      telegram: this.chatData,
      silent,
    });
    await this.rpc(jsonldRequest);
  }
}
/**
 * @param {TelegramMessage} message - message
 * @param {boolean} silent - silent dialog
 * @returns {Promise<undefined>}
 */
module.exports = async (message, silent) => {
  const location = new Location(message);
  await location.beginDialog(silent);
};
