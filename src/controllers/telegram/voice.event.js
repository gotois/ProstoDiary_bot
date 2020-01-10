const bot = require('../../core/bot');
const package_ = require('../../../package');
const { pool } = require('../../core/database');
const passportQueries = require('../../db/passport');
const voiceService = require('../../services/voice.service');
const { getTelegramFile } = require('../../services/file.service');
const TelegramBotRequest = require('./telegram-bot-request');

class Voice extends TelegramBotRequest {
  async beginDialog() {
    await super.beginDialog();

    const secretKey = await pool.connect(async (connection) => {
      const botTable = await connection.one(
        passportQueries.selectByPassport(this.message.passport.id),
      );
      return botTable.secret_key;
    });

    const fileBuffer = await getTelegramFile(this.message.voice.file_id);

    // todo: сначала разбираем услышанное самостоятельно чтобы понять какой диалог дергать
    //  ... const text = await voiceToText(fileBuffer, this.message.voice);

    const messageResult = await voiceService.prepareVoice({
      buffer: fileBuffer,
      secretKey,
      mimeType: this.message.voice.mime_type,
      fileSize: this.message.voice.file_size,
      duration: this.message.voice.duration,
      uid: this.userHash,
      passportId: this.message.passport.id,
    });

    const result = await this.request('post', {
      ...messageResult,
      date: this.message.date,
      mime: messageResult.mime,
      chat_id: this.message.chat.id,
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
