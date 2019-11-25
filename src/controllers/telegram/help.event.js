const bot = require('../../core/bot');
const TelegramBotRequest = require('./telegram-bot-request');

class Help extends TelegramBotRequest {
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
module.exports = async (message) => {
  const help = new Help(message);
  await help.beginDialog();
};
