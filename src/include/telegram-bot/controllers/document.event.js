const TelegramBotRequest = require('./telegram-bot-request');
const documentAction = require('../../../core/functions/document');
const TelegramMessage = require('../models/telegram-bot-message');

class Document extends TelegramBotRequest {
  constructor(message) {
    super(message);
    this.method = 'insert';
  }
  async beginDialog(silent) {
    await super.beginDialog(silent);
    const fileBuffer = await this.getTelegramFile(
      this.message.document.file_id,
    );
    const jsonldRequest = await documentAction({
      buffer: fileBuffer,
      caption: this.message.caption,
      filename: this.message.document.file_name,
      filesize: this.message.document.file_size,
      mimeType: this.message.document.mime_type,
      date: this.message.date,
      creator: this.creator,
      publisher: this.publisher,
      telegram: this.chatData,
      hashtags: this.hashtags,
      silent,
    });
    await this.rpc(jsonldRequest);
  }
}
/**
 * @description пример считывания zip архива; его распаковка; нахождение export.xml и его превращение в json
 * @param {TelegramMessage} message - msg
 * @param {boolean} silent - silent dialog
 * @returns {Promise<undefined>}
 */
module.exports = async (message, silent) => {
  const document = new Document(message);
  await document.beginDialog(silent);
};
