const jsonrpc = require('jsonrpc-lite');
const bot = require('../core/bot');
const logger = require('../services/logger.service');
const { voiceToText } = require('../services/voice.service');
const { getTelegramFile } = require('../services/telegram-file.service');
const TelegramBotRequest = require('./telegram-bot-request');
const APIv2Mail = require('../api/v2/mail');

class Voice extends TelegramBotRequest {
  constructor(message) {
    super(message);
    this.api = APIv2Mail;
  }
  async beginDialog() {
    logger.log('info', Voice.name);
    const fileBuffer = await getTelegramFile(this.message.voice.file_id);
    const text = await voiceToText(fileBuffer, this.message.voice);
    // todo: вычлинять команды из текста и в зависимости от этого делать либо /search либо запись
    //  ...
    const requestObject = jsonrpc.request('123', 'mail', {
      buffer: Buffer.from(text),
      mime: 'plain/text',
    });
    const result = await this.request(requestObject);
    await bot.sendMessage(this.message.chat.id, result);
  }
}
/**
 * @param {TelegramMessage} message - msg
 * @returns {Promise<undefined>}
 */
const onVoice = async (message) => {
  const voice = new Voice(message);
  await voice.beginDialog();
};

module.exports = onVoice;
