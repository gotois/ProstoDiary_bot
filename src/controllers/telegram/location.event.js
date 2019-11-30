const bot = require('../../core/bot');
const package_ = require('../../../package');
const TelegramBotRequest = require('./telegram-bot-request');

class Location extends TelegramBotRequest {
  async beginDialog() {
    await super.beginDialog();
    const { latitude, longitude } = this.message.location;
    const result = await this.request('post', {
      text: latitude + ':' + longitude,
      date: this.message.date,
      creator: this.message.from.id,
      publisher: package_.author.email,
      telegram_message_id: this.message.message_id,
    });
    await bot.sendMessage(this.message.chat.id, result);
  }
}
/**
 * @param {TelegramMessage} message - message
 * @returns {Promise<undefined>}
 */
module.exports = async (message) => {
  if (!message.gotois.activated) {
    throw new Error('Bot not activated');
  }
  const location = new Location(message);
  await location.beginDialog();
};
