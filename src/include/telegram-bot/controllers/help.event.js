const bot = require('../bot');
const helpAction = require('../../../core/functions/help');
const TelegramBotRequest = require('./telegram-bot-request');

class Help extends TelegramBotRequest {
  async beginDialog(silent) {
    await super.beginDialog();
    const result = await helpAction({
      jwt: this.message.passport.jwt,
    });
    if (!silent) {
      await bot.sendMessage(this.message.chat.id, result.purpose.abstract, {
        disable_web_page_preview: true,
        parse_mode:
          result.purpose.encodingFormat === 'text/markdown'
            ? 'Markdown'
            : 'HTML',
      });
    }
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
