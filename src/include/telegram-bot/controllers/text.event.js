const TelegramBotRequest = require('./telegram-bot-request');
const textAction = require('../../../core/functions/text');
const logger = require('../../../lib/log');

class Text extends TelegramBotRequest {
  constructor(message) {
    super(message);
    this.method = 'insert';
  }
  async beginDialog(silent) {
    await super.beginDialog(silent);
    logger.info(this.message);
    try {
      await this.bot.sendChatAction(this.message.chat.id, 'typing');
      const jsonldRequest = await textAction({
        text: this.message.text,
        hashtags: this.hashtags,
        telegram: {
          ...this.chatData,
          messageId: this.message.message_id,
        },
        creator: this.creator,
        publisher: this.publisher,
        silent,
      });
      await this.rpc(jsonldRequest);
    } catch (error) {
      logger.error(error.stack);
      if (!silent) {
        await this.bot.editMessageText(String(error.message), {
          chat_id: this.message.chat.id,
          message_id: this.message.message_id,
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
