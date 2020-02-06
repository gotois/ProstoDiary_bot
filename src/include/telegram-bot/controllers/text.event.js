const bot = require('../bot');
const textService = require('../../../services/text.service');
const TelegramBotRequest = require('./telegram-bot-request');
const textMessage = require('../../../core/functions/text');

class Text extends TelegramBotRequest {
  onError(error) {
    throw error;
  }
  async beginDialog() {
    await super.beginDialog();
    const { message_id } = await bot.sendMessage(
      this.message.chat.id,
      `_${textService.previousInput(this.message.text)}_ 📝`,
      {
        parse_mode: 'Markdown',
        disable_notification: true,
        disable_web_page_preview: true,
      },
    );
    try {
      await bot.sendChatAction(this.message.chat.id, 'typing');
      const text = await textService.correctionText(this.message.text);
      const textAction = await textMessage(
        this.message.passport,
        text,
        this.hashtags,
        this.message.chat.id,
        message_id,
      );
      const result = await this.request('text', textAction);
      await bot.editMessageText(result.purpose.abstract, {
        chat_id: this.message.chat.id,
        message_id: message_id,
      });
    } catch (error) {
      await bot.editMessageText(error.message, {
        chat_id: this.message.chat.id,
        message_id: message_id,
      });
    }
  }
}
/**
 * @param {TelegramMessage} message - message
 * @returns {Promise<undefined>}
 */
module.exports = async (message) => {
  if (!message.passport.activated) {
    throw new Error('Bot not activated. Please try /start or /signin');
  }
  const text = new Text(message);
  await text.beginDialog();
};
