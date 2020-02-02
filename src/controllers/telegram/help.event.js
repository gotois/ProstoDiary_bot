const bot = require('../../core/bot');
const helpMessage = require('../../core/functions/help');
const TelegramBotRequest = require('./telegram-bot-request');

class Help extends TelegramBotRequest {
  async beginDialog() {
    await super.beginDialog();
    const helpAction = helpMessage();
    const result = await this.request('help', helpAction);
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
