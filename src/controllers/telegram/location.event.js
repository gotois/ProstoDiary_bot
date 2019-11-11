const bot = require('../../core/bot');
const pkg = require('../../../package');
const TelegramBotRequest = require('./telegram-bot-request');

class Location extends TelegramBotRequest {
  constructor(message, session) {
    super(message, session);
  }
  async beginDialog() {
    await super.beginDialog();
    const { latitude, longitude } = this.message.location;
    const result = await this.request('post', {
      text: latitude + ':' + longitude,
      date: this.message.date,
      creator: this.message.from.id,
      publisher: pkg.author.email,
      telegram_message_id: this.message.message_id,
    });
    await bot.sendMessage(this.message.chat.id, result);
  }
}
/**
 * @param {TelegramMessage} message - message
 * @returns {Promise<undefined>}
 */
module.exports = async (message, session) => {
  console.log(message)
  const location = new Location(message, session);
  await location.beginDialog();
};
