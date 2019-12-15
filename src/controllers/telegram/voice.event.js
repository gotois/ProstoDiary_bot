const bot = require('../../core/bot');
const package_ = require('../../../package');
const { voiceToText } = require('../../services/voice.service');
const { getTelegramFile } = require('../../services/file.service');
const TelegramBotRequest = require('./telegram-bot-request');

class Voice extends TelegramBotRequest {
  async beginDialog() {
    await super.beginDialog();
    const fileBuffer = await getTelegramFile(this.message.voice.file_id);
    const text = await voiceToText(fileBuffer, this.message.voice);
    // todo: вычлинять команды из текста и в зависимости от этого делать либо /search либо запись
    //  ...
    const result = await this.request('post', {
      text: text,
      date: this.message.date,
      mime: 'plain/text',
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
