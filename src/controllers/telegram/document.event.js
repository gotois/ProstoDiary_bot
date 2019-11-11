const pkg = require('../../../package');
const bot = require('../../core/bot');
const { getTelegramFile } = require('../../services/file.service');
const TelegramBotRequest = require('./telegram-bot-request');

class Document extends TelegramBotRequest {
  constructor(message, session) {
    super(message, session);
  }
  async beginDialog() {
    await super.beginDialog();
    const fileBuffer = await getTelegramFile(this.message.document.file_id);
    const result = await this.request('post', {
      file: fileBuffer,
      mime: this.message.document.mime_type,
      date: this.message.date,
      creator: this.message.from.id,
      publisher: pkg.author.email,
      telegram_message_id: this.message.message_id,
    });
    await bot.sendMessage(this.message.chat.id, result);
  }
}
/**
 * @description пример считывания zip архива; его распаковка; нахождение export.xml и его превращение в json
 * @param {TelegramMessage} message - msg
 * @returns {Promise<undefined>}
 */
module.exports = async (message, session) => {
  const document = new Document(message, session);
  await document.beginDialog();
};
