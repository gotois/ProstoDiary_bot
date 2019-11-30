const package_ = require('../../../package');
const bot = require('../../core/bot');
const format = require('../../services/format.service');
const TelegramBotRequest = require('./telegram-bot-request');
/**
 * @typedef {number} COMMANDS_ENUM
 **/
class Text extends TelegramBotRequest {
  onError(error) {
    throw error;
  }
  async beginDialog() {
    await super.beginDialog();
    const { message_id } = await bot.sendMessage(
      this.message.chat.id,
      `_${format.previousInput(this.message.text)}_ 📝`,
      {
        parse_mode: 'Markdown',
        disable_notification: true,
        disable_web_page_preview: true,
      },
    );
    try {
      const result = await this.request('post', {
        text: this.message.text,
        date: this.message.date,
        mime: 'plain/text',
        telegram_message_id: message_id,
        chat_id: this.message.chat.id,
        creator: this.message.gotois.email,
        publisher: package_.author.email,
      });
      await bot.editMessageText(result, {
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
  if (!message.gotois.activated) {
    throw new Error('Bot not activated');
  }
  const text = new Text(message);
  await text.beginDialog();
};
