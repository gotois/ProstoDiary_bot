const package_ = require('../../../package');
const bot = require('../../core/bot');
const { getTelegramFile } = require('../../services/file.service');
const TelegramBotRequest = require('./telegram-bot-request');

class Photo extends TelegramBotRequest {
  async beginDialog() {
    await super.beginDialog();
    const [_smallPhoto, mediumPhoto] = this.message.photo;
    if (!mediumPhoto.file_id || mediumPhoto.file_size === 0) {
      await bot.sendMessage(this.message.chat.id, 'Wrong photo');
      return;
    }
    this.photo = mediumPhoto;
    const fileBuffer = await getTelegramFile(this.photo.file_id);
    const result = await this.request('post', {
      file: fileBuffer,
      mime: this.message.document.mime_type, // todo: возможно надо брать иным способом
      caption: this.message.caption,
      date: this.message.date,
      from: {
        email: package_.author.email,
        name: this.message.passport.id,
      },
      to: [
        {
          email: this.message.passport.botEmail,
          name: this.message.passport.botId,
        },
      ],
      telegram_message_id: this.message.message_id,
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
