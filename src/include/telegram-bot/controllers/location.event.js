const bot = require('../bot');
const TelegramBotRequest = require('./telegram-bot-request');
const locationAction = require('../../../core/functions/location');

class Location extends TelegramBotRequest {
  async beginDialog() {
    await super.beginDialog();
    const { latitude, longitude } = this.message.location;
    const result = await locationAction({
      latitude,
      longitude,
      date: this.message.date,
      telegram_message_id: this.message.message_id,
      jwt: this.message.passport.jwt,
    });
    await bot.sendMessage(this.message.chat.id, result);
  }
}
/**
 * @param {TelegramMessage} message - message
 * @returns {Promise<undefined>}
 */
module.exports = async (message) => {
  if (!message.passport.activated) {
    throw new Error('Bot not activated');
  }
  const location = new Location(message);
  await location.beginDialog();
};
