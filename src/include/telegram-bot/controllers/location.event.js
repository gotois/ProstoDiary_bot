const TelegramBotRequest = require('./telegram-bot-request');
const locationAction = require('../../../core/functions/location');

class Location extends TelegramBotRequest {
  async beginDialog(silent) {
    await super.beginDialog(silent);
    const { latitude, longitude } = this.message.location;
    const jsonldAction = await locationAction({
      latitude,
      longitude,
      date: this.message.date,
      telegram_message_id: this.message.message_id,
      creator: this.creator,
      publisher: this.publisher,
      silent,
    });
    await this.rpc(jsonldAction);
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
