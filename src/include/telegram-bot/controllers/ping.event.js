const pingAction = require('../../../core/functions/ping');
const TelegramBotRequest = require('./telegram-bot-request');

class Ping extends TelegramBotRequest {
  constructor(message) {
    super(message);
    this.method = 'ping';
  }
  async beginDialog(silent) {
    await super.beginDialog(silent);
    const result = await pingAction({
      telegram: {
        title: this.message.chat.title,
        chatId: this.message.chat.id,
      },
      creator: this.creator,
      publisher: this.publisher,
      silent,
    });
    await this.rpc(result);
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
