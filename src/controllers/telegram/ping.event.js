const bot = require('../../core/bot');
const pingMessage = require('../../core/functions/ping');
const TelegramBotRequest = require('./telegram-bot-request');

class Ping extends TelegramBotRequest {
  async beginDialog() {
    await super.beginDialog();
    const pingAction = pingMessage();
    const result = await this.request('ping', pingAction);
    await bot.sendMessage(this.message.chat.id, result.purpose.abstract);
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
