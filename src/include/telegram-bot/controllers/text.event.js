const textService = require('../../../services/text.service');
const TelegramBotRequest = require('./telegram-bot-request');
const textAction = require('../../../core/functions/text');
const logger = require('../../../lib/log');

class Text extends TelegramBotRequest {
  constructor(message) {
    super(message);
    this.method = 'insert';
  }
  async beginDialog(silent) {
    await super.beginDialog();
    let tgMessageId = this.message.message_id;
    logger.info(this.message);
    if (!silent) {
      const { message_id } = await this.bot.sendMessage(
        this.message.chat.id,
        `_${textService.previousInput(this.message.text)}_ 📝`,
        {
          parse_mode: 'Markdown',
          disable_notification: true,
          disable_web_page_preview: true,
        },
      );
      tgMessageId = message_id;
      await this.bot.sendChatAction(this.message.chat.id, 'typing');
    }
    try {
      const jsonldAction = await textAction({
        text: this.message.text,
        hashtags: this.hashtags,
        telegram: {
          title: this.message.chat.title,
          chatId: this.message.chat.id,
          messageId: tgMessageId,
        },
        creator: this.message.passport.assistant,
        publisher: this.message.passport.email,
        silent,
      });
      await this.rpc(jsonldAction);
    } catch (error) {
      logger.error(error);
      if (!silent) {
        await this.bot.editMessageText(String(error.message), {
          chat_id: this.message.chat.id,
          message_id: tgMessageId,
        });
      }
    }
  }
}
/**
 * @param {TelegramMessage} message - message
 * @param {boolean} silent - silent dialog
 * @returns {Promise<undefined>}
 */
module.exports = async (message, silent) => {
  const text = new Text(message);
  await text.beginDialog(silent);
};
