const bot = require('../bot');
const pingAction = require('../../../core/functions/ping');
const TelegramBotRequest = require('./telegram-bot-request');
const { rpc } = require('../../../services/request.service');

class Ping extends TelegramBotRequest {
  constructor(message) {
    super(message);
    this.method = 'ping';
  }
  async beginDialog(silent) {
    await super.beginDialog();
    const result = await pingAction();
    const jsonldMessage = await rpc({
      body: {
        jsonrpc: '2.0',
        method: this.method,
        id: 1,
        params: result.context,
      },
      jwt: this.message.passport.jwt,
    });
    if (!silent) {
      await bot.sendMessage(
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
