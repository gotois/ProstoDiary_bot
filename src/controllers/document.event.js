const jsonrpc = require('jsonrpc-lite');
const bot = require('../core/bot');
const logger = require('../services/logger.service');
const { getTelegramFile } = require('../services/file.service');
const APIPost = require('../api/v2/post');
const TelegramBotRequest = require('./telegram-bot-request');

class Document extends TelegramBotRequest {
  constructor(message) {
    super(message);
    this.api = APIPost;
  }
  async beginDialog() {
    logger.log('info', Document.name);
    const fileBuffer = await getTelegramFile(this.message.document.file_id);
    const requestObject = jsonrpc.request('123', 'mail', {
      buffer: fileBuffer,
      mime: this.message.document.mime_type,
      date: this.message.date,
      telegram_user_id: this.message.from.id,
      telegram_message_id: this.message.message_id,
    });
    const result = await this.request(requestObject);
    await bot.sendMessage(this.message.chat.id, result);
  }
}
/**
 * @description пример считывания zip архива; его распаковка; нахождение export.xml и его превращение в json
 * @param {TelegramMessage} message - msg
 * @returns {Promise<undefined>}
 */
const onDocument = async (message) => {
  const document = new Document(message);
  await document.beginDialog();
};

module.exports = onDocument;
