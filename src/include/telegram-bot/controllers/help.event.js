const bot = require('../bot');
const helpAction = require('../../../core/functions/help');
const TelegramBotRequest = require('./telegram-bot-request');

class Help extends TelegramBotRequest {
  async beginDialog() {
    await super.beginDialog();
    const result = await helpAction({
      auth: {
        user: this.message.passport.user,
        pass: this.message.passport.masterPassword,
      },
    });
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
