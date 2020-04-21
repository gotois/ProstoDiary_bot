const helpAction = require('../../../core/functions/help');
const TelegramBotRequest = require('./telegram-bot-request');

class Help extends TelegramBotRequest {
  constructor(message) {
    super(message);
    this.method = 'help';
  }
  async beginDialog(silent) {
    await super.beginDialog(silent);
    const jsonldRequest = await helpAction({
      telegram: {
        title: this.message.chat.title,
        chatId: this.message.chat.id,
      },
      creator: this.creator,
      publisher: this.publisher,
      silent,
    });
    await this.rpc(jsonldRequest);
  }
}
/**
 * @param {TelegramMessage} message - message
 * @param {boolean} silent - silent dialog
 * @returns {Promise<undefined>}
 */
module.exports = async (message, silent) => {
  const help = new Help(message);
  await help.beginDialog(silent);
};
