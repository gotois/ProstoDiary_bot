const TelegramBotRequest = require('./telegram-bot-request');
const photoAction = require('../../../core/functions/photo');

class Photo extends TelegramBotRequest {
  constructor(message) {
    super(message);
    this.method = 'insert';
  }
  async beginDialog(silent) {
    await super.beginDialog(silent);
    const [_smallPhoto, mediumPhoto] = this.message.photo;
    if (!mediumPhoto.file_id || mediumPhoto.file_size === 0) {
      if (!silent) {
        await this.bot.sendMessage(this.message.chat.id, 'Wrong photo');
      }
      return;
    }
    const imageBuffer = await this.getTelegramFile(mediumPhoto.file_id);
    const jsonldRequest = await photoAction({
      imageBuffer,
      caption: this.message.caption,
      creator: this.creator,
      publisher: this.publisher,
      telegram: {
        title: this.message.chat.title,
        chatId: this.message.chat.id,
        messageId: this.message.message_id,
      },
      date: this.message.date,
      hashtags: this.hashtags,
    });
    await this.rpc(jsonldRequest);
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
