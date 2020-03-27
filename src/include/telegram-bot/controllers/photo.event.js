const TelegramBotRequest = require('./telegram-bot-request');
const photoAction = require('../../../core/functions/photo');

class Photo extends TelegramBotRequest {
  constructor(message) {
    super(message);
    this.method = 'insert';
  }
  async beginDialog(silent) {
    await super.beginDialog();
    const [_smallPhoto, mediumPhoto] = this.message.photo;
    if (!mediumPhoto.file_id || mediumPhoto.file_size === 0) {
      if (!silent) {
        await this.bot.sendMessage(this.message.chat.id, 'Wrong photo');
      }
      return;
    }
    if (!silent) {
      await this.bot.sendChatAction(this.message.chat.id, 'typing');
    }
    const imageBuffer = await this.getTelegramFile(mediumPhoto.file_id);
    const jsonldAction = await photoAction({
      imageBuffer,
      caption: this.message.caption,
      date: this.message.date,
      hashtags: this.hashtags,
      telegram_message_id: this.message.message_id,
    });
    const jsonldMessage = await this.rpc(jsonldAction);
    if (!silent) {
      await this.bot.sendMessage(
        this.message.chat.id,
        jsonldMessage.purpose.abstract,
        {
          parse_mode: 'Markdown',
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
  const photo = new Photo(message);
  await photo.beginDialog(silent);
};
