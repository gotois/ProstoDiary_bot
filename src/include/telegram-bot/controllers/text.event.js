const bot = require('../bot');
const textService = require('../../../services/text.service');
const TelegramBotRequest = require('./telegram-bot-request');
const textAction = require('../../../core/functions/text');

class Text extends TelegramBotRequest {
  async beginDialog(silent) {
    await super.beginDialog();
    let tgMessageId;
    if (!silent) {
      const { message_id } = await bot.sendMessage(
        this.message.chat.id,
        `_${textService.previousInput(this.message.text)}_ 📝`,
        {
          parse_mode: 'Markdown',
          disable_notification: true,
          disable_web_page_preview: true,
        },
      );
      tgMessageId = message_id;
      await bot.sendChatAction(this.message.chat.id, 'typing');
    }
    try {
      const text = await textService.correctionText(this.message.text);
      const result = await textAction({
        text,
        // hashtags: this.hashtags, // todo поддержать на стороне JSONLD
        // chatId: this.message.chat.id, // todo поддержать на стороне JSONLD
        tgMessageId,
        creator: this.message.passport.assistant,
        publisher: this.message.passport.email,
        jwt: this.message.passport.jwt,
      });
      if (!silent) {
        await bot.editMessageText(result.purpose.abstract, {
          chat_id: this.message.chat.id,
          message_id: tgMessageId,
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
      }
    } catch (error) {
      await bot.editMessageText(String(error.message), {
        chat_id: this.message.chat.id,
        message_id: tgMessageId,
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
  const text = new Text(message);
  await text.beginDialog(silent);
};
