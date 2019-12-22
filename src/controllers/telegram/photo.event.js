const package_ = require('../../../package');
const bot = require('../../core/bot');
const { getTelegramFile } = require('../../services/file.service');
const photoService = require('../../services/photo.service');
const TelegramBotRequest = require('./telegram-bot-request');
const { pool } = require('../../core/database');
const passportQueries = require('../../db/passport');

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
    const secretKey = await pool.connect(async (connection) => {
      const botTable = await connection.one(
        passportQueries.selectByPassport(this.message.passport.id),
      );
      return botTable.secret_key;
    });
    const messageResult = await photoService.prepareImage({
      imageBuffer,
      secretKey,
      caption: this.message.caption,
    });
    const result = await this.request('post', {
      ...messageResult,
      date: this.message.date,
      categories: ['transaction-write'].concat(messageResult.categories),
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
