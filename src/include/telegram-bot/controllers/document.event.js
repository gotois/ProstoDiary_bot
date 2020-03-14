const bot = require('../bot');
const { getTelegramFile } = require('../../../services/file.service');
const TelegramBotRequest = require('./telegram-bot-request');
const documentAction = require('../../../core/functions/document');

class Document extends TelegramBotRequest {
  async beginDialog(silent) {
    await super.beginDialog();
    const fileBuffer = await getTelegramFile(this.message.document.file_id);
    const result = await documentAction({
      file: fileBuffer,
      mime: this.message.document.mime_type,
      date: this.message.date,
      telegram_message_id: this.message.message_id,
      jwt: this.message.passport.jwt,
    });
    if (!silent) {
      await bot.sendMessage(this.message.chat.id, result);
    }
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
