const jsonrpc = require('jsonrpc-lite');
const pkg = require('../../package');
const bot = require('../core/bot');
const logger = require('../services/logger.service');
const { getTelegramFile } = require('../services/file.service');
const TelegramBotRequest = require('./telegram-bot-request');
const APIPost = require('../api/v2/post');

class Photo extends TelegramBotRequest {
  constructor(message) {
    super(message);
    this.api = APIPost;
  }

  async beginDialog() {
    logger.log('info', Photo.name);
    const [_smallPhoto, mediumPhoto] = this.message.photo;
    if (!mediumPhoto.file_id || mediumPhoto.file_size === 0) {
      await bot.sendMessage(this.message.chat.id, 'Wrong photo');
      return;
    }
    this.photo = mediumPhoto;
    const fileBuffer = await getTelegramFile(this.photo.file_id);
    const requestObject = jsonrpc.request('123', 'mail', {
      buffer: fileBuffer,
      caption: this.message.caption,
      date: this.message.date,
      creator: this.message.from.id,
      publisher: pkg.author.email,
      telegram_message_id: this.message.message_id,
    });
    const result = await this.request(requestObject);
    await bot.sendMessage(this.message.chat.id, result, {
      parse_mode: 'Markdown',
    });
  }
}
/**
 * @param {TelegramMessage} message - message
 * @returns {Promise<undefined>}
 */
const onPhoto = async (message) => {
  const photo = new Photo(message);
  await photo.beginDialog();
};

module.exports = onPhoto;
