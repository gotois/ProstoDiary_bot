const pingAction = require('../../../core/functions/ping');
const TelegramBotRequest = require('./telegram-bot-request');

class Ping extends TelegramBotRequest {
  constructor(message) {
    super(message);
    this.method = 'ping';
  }
  async beginDialog(silent) {
    await super.beginDialog();
    const result = await pingAction();
    const jsonldMessage = await this.rpc(result);
    if (!silent) {
      await this.bot.sendMessage(
        this.message.chat.id,
        jsonldMessage.purpose.abstract,
      );
    }
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
