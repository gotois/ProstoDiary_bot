const TelegramBotRequest = require('./telegram-bot-request');
const documentAction = require('../../../core/functions/document');

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
    const jsonldAction = await documentAction({
      buffer: fileBuffer,
      mimeType: this.message.document.mime_type,
      date: this.message.date,
      telegram: {
        messageId: this.message.message_id,
      },
      silent,
    });
    await this.rpc(jsonldAction);
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
