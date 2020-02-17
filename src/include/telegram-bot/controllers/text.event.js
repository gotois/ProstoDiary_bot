const bot = require('../bot');
const textService = require('../../../services/text.service');
const TelegramBotRequest = require('./telegram-bot-request');
const textAction = require('../../../core/functions/text');

class Text extends TelegramBotRequest {
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
    await bot.sendChatAction(this.message.chat.id, 'typing');
    try {
      const text = await textService.correctionText(this.message.text);
      const result = await textAction({
        text,
        // hashtags: this.hashtags, // todo поддержать на стороне JSONLD
        // chatId: this.message.chat.id, // todo поддержать на стороне JSONLD
        tgMessageId: message_id,
        creator: this.message.passport.assistant,
        publisher: this.message.passport.email,
        jwt: this.message.passport.jwt,
      });
      await bot.editMessageText(result.purpose.abstract, {
        chat_id: this.message.chat.id,
        message_id: message_id,
        parse_mode: result.purpose.isBasedOn.encodingFormat,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: result.purpose.isBasedOn.name,
                url: result.purpose.isBasedOn.url,
              },
            ],
          ],
        },
      });
    } catch (error) {
      await bot.editMessageText(String(error.message), {
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
