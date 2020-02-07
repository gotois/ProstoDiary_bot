const bot = require('../bot');
const { getTelegramFile } = require('../../../services/file.service');
const TelegramBotRequest = require('./telegram-bot-request');
const photoAction = require('../../../core/functions/photo');

class Photo extends TelegramBotRequest {
  async beginDialog() {
    await super.beginDialog();
    const [_smallPhoto, mediumPhoto] = this.message.photo;
    if (!mediumPhoto.file_id || mediumPhoto.file_size === 0) {
      await bot.sendMessage(this.message.chat.id, 'Wrong photo');
      return;
    }
    await bot.sendChatAction(this.message.chat.id, 'typing');
    const imageBuffer = await getTelegramFile(mediumPhoto.file_id);
    const result = await photoAction({
      imageBuffer,
      caption: this.message.caption,
      date: this.message.date,
      hashtags: this.hashtags,
      telegram_message_id: this.message.message_id,
      auth: {
        user: this.message.passport.user,
        pass: this.message.passport.masterPassword,
      },
    });
    await bot.sendMessage(this.message.chat.id, result, {
      parse_mode: 'Markdown',
    });
  }
}
/**
 * @param {TelegramMessage} message - message
 * @returns {Promise<undefined>}
 */
module.exports = async (message) => {
  if (!message.passport.activated) {
    throw new Error('Bot not activated');
  }
  const photo = new Photo(message);
  await photo.beginDialog();
};
