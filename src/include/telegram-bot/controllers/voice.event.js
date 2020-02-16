const bot = require('../bot');
const { getTelegramFile } = require('../../../services/file.service');
const TelegramBotRequest = require('./telegram-bot-request');
const voiceAction = require('../../../core/functions/voice');

class Voice extends TelegramBotRequest {
  async beginDialog() {
    await super.beginDialog();
    const fileBuffer = await getTelegramFile(this.message.voice.file_id);

    const result = await voiceAction({
      buffer: fileBuffer,
      date: this.message.date,
      chat_id: this.message.chat.id,
      mimeType: this.message.voice.mime_type,
      fileSize: this.message.voice.file_size,
      duration: this.message.voice.duration,
      uid: this.userHash,
      passportId: this.message.passport.id,
      jwt: this.message.passport.jwt,
    });
    await bot.sendMessage(this.message.chat.id, result);
  }
}
/**
 * @param {TelegramMessage} message - msg
 * @returns {Promise<undefined>}
 */
module.exports = async (message) => {
  if (!message.passport.activated) {
    throw new Error('Bot not activated');
  }
  const voice = new Voice(message);
  await voice.beginDialog();
};
