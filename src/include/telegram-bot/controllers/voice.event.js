const TelegramBotRequest = require('./telegram-bot-request');
const voiceAction = require('../../../core/functions/voice');

class Voice extends TelegramBotRequest {
  constructor(message) {
    super(message);
    this.method = 'insert';
  }
  async beginDialog(silent) {
    await super.beginDialog(silent);
    const fileBuffer = await this.getTelegramFile(this.message.voice.file_id);
    const jsonldRequest = await voiceAction({
      buffer: fileBuffer,
      date: this.message.date,
      chat_id: this.message.chat.id,
      mimeType: this.message.voice.mime_type,
      fileSize: this.message.voice.file_size,
      duration: this.message.voice.duration,
      uid: this.userHash,
      creator: this.creator,
      publisher: this.publisher,
      // todo добавить telegram свойство
      passportId: this.message.passports[0].id,
    });
    await this.rpc(jsonldRequest);
  }
}
/**
 * @param {TelegramMessage} message - msg
 * @param {boolean} silent - silent dialog
 * @returns {Promise<undefined>}
 */
module.exports = async (message, silent) => {
  const voice = new Voice(message);
  await voice.beginDialog(silent);
};
