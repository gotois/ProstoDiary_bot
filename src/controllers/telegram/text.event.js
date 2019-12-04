const package_ = require('../../../package');
const bot = require('../../core/bot');
const format = require('../../services/text.service');
const TelegramBotRequest = require('./telegram-bot-request');

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
      await bot.sendChatAction(this.message.chat.id, 'typing');
      // Валидация и формирование зашифрованного сообщения
      const messageResult = await this.request('text', {
        text: this.message.text,
        caption: this.message.caption,
        passportId: this.message.gotois.id,
      });
      // Отправка зашифрованного сообщения на почту бота
      const postResult = await this.request('post', {
        ...messageResult,
        date: this.message.date,
        chat_id: this.message.chat.id,
        from: {
          email: package_.author.email,
        },
        to: [
          {
            email: this.message.gotois.email,
          },
        ],
        telegram_message_id: message_id,
      });
      await bot.editMessageText(postResult, {
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
    throw new Error('Bot not activated. Please try /start or /signin');
  }
  const text = new Text(message);
  await text.beginDialog();
};
