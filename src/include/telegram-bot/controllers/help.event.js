const bot = require('../bot');
const helpAction = require('../../../core/functions/help');
const TelegramBotRequest = require('./telegram-bot-request');

class Help extends TelegramBotRequest {
  constructor(message) {
    super(message);
    this.method = 'help';
  }
  async beginDialog(silent) {
    await super.beginDialog();
    const jsonldAction = await helpAction();
    const jsonldMessage = await this.rpc(jsonldAction);
    if (!silent) {
      await bot.sendMessage(
        this.message.chat.id,
        jsonldMessage.purpose.abstract,
        {
          disable_web_page_preview: true,
          parse_mode:
            jsonldMessage.purpose.encodingFormat === 'text/markdown'
              ? 'Markdown'
              : 'HTML',
        },
      );
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
