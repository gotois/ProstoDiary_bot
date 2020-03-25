const bot = require('../bot');
const helpAction = require('../../../core/functions/help');
const TelegramBotRequest = require('./telegram-bot-request');
const { rpc } = require('../../../services/request.service');

class Help extends TelegramBotRequest {
  constructor(message) {
    super(message);
    this.method = 'help';
  }
  async beginDialog(silent) {
    await super.beginDialog();
    const result = await helpAction();
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
