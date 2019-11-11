const bot = require('../../core/bot');
const TelegramBotRequest = require('./telegram-bot-request');

class Ping extends TelegramBotRequest {
  constructor(message, session) {
    super(message, session);
  }
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
module.exports = async (message, session) => {
  const ping = new Ping(message, session);
  await ping.beginDialog();
};
