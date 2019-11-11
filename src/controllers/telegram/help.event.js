const bot = require('../../core/bot');
const TelegramBotRequest = require('./telegram-bot-request');

class Help extends TelegramBotRequest {
  constructor(message, session) {
    super(message, session);
  }
  async beginDialog() {
    await super.beginDialog();
    const result = await this.request('help');
    await bot.sendMessage(this.message.chat.id, result, {
      parse_mode: 'Markdown',
    });
  }
}
/**
 * @param {TelegramMessage} message - message
 * @returns {Promise<undefined>}
 */
module.exports = async (message, session) => {
  const help = new Help(message, session);
  await help.beginDialog();
};
