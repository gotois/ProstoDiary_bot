const bot = require('../bot');
const { rpc } = require('../../../services/request.service');
const { getTelegramFile } = require('../../../services/file.service');
const TelegramBotRequest = require('./telegram-bot-request');
const voiceAction = require('../../../core/functions/voice');

class Voice extends TelegramBotRequest {
  async beginDialog(silent) {
    await super.beginDialog();
    const fileBuffer = await getTelegramFile(this.message.voice.file_id);
    const jsonldAction = await voiceAction({
      buffer: fileBuffer,
      date: this.message.date,
      chat_id: this.message.chat.id,
      mimeType: this.message.voice.mime_type,
      fileSize: this.message.voice.file_size,
      duration: this.message.voice.duration,
      uid: this.userHash,
      passportId: this.message.passport.id,
    });
    const jsonldMessage = await rpc({
      body: {
        jsonrpc: '2.0',
        method: 'insert',
        id: 1,
        params: jsonldAction.context,
      },
      jwt: this.message.passport.jwt,
    });
    if (!silent) {
      await bot.sendMessage(this.message.chat.id, jsonldMessage);
    }
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
