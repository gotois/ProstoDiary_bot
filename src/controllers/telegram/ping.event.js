const bot = require('../../core/bot');
const TelegramBotRequest = require('./telegram-bot-request');

class Ping extends TelegramBotRequest {
  async beginDialog() {
    await super.beginDialog();
    const result = await this.request('ping');
    await bot.sendMessage(this.message.chat.id, result);
  }
}
/**
 * @param {TelegramMessage} message - message
 * @returns {Promise<undefined>}
 */
module.exports = async (message) => {
  const ping = new Ping(message);
  await ping.beginDialog();
};
