const TelegramBotRequest = require('./telegram-bot-request');
const TelegramMessage = require('../models/telegram-bot-message');
const {AbstractAction} = require('vzor');// fixme

class Ping extends TelegramBotRequest {
  constructor(message) {
    super(message);
    this.method = 'ping';
  }
  async beginDialog(silent) {
    await super.beginDialog(silent);

    const pingAction = new AbstractAction({
      command: 'Ping',
    });

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
 * Проверка ping
 *
 * @param {TelegramMessage} message - message
 * @param {boolean} silent - silent
 * @returns {Promise<undefined>}
 */
module.exports = async (message, silent) => {
  const ping = new Ping(message);
  await ping.beginDialog(silent);
};
