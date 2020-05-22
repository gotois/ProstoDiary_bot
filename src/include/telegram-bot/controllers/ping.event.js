const pingAction = require('../../../core/functions/ping');
const TelegramBotRequest = require('./telegram-bot-request');
const TelegramMessage = require('../models/telegram-bot-message');

class Ping extends TelegramBotRequest {
  constructor(message) {
    super(message);
    this.method = 'ping';
  }
  async beginDialog(silent) {
    await super.beginDialog(silent);
    const jsonldRequest = await pingAction({
      telegram: this.chatData,
      creator: this.creator,
      publisher: this.publisher,
      silent,
    });
    await this.rpc(jsonldRequest);
  }
}
/**
 * @param {TelegramMessage} message - message
 * @param {boolean} silent - silent
 * @returns {Promise<undefined>}
 */
module.exports = async (message, silent) => {
  const ping = new Ping(message);
  await ping.beginDialog(silent);
};
