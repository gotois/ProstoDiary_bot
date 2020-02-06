const package_ = require('../../../../package');
const bot = require('../bot');
const { getTelegramFile } = require('../../../services/file.service');
const TelegramBotRequest = require('./telegram-bot-request');

class Document extends TelegramBotRequest {
  async beginDialog() {
    await super.beginDialog();
    const fileBuffer = await getTelegramFile(this.message.document.file_id);
    const result = await this.request('post', {
      file: fileBuffer, // todo это поле уже не используется
      mime: this.message.document.mime_type,
      date: this.message.date,
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
      telegram_message_id: this.message.message_id,
    });
    await bot.sendMessage(this.message.chat.id, result);
  }
}
/**
 * @description пример считывания zip архива; его распаковка; нахождение export.xml и его превращение в json
 * @param {TelegramMessage} message - msg
 * @returns {Promise<undefined>}
 */
module.exports = async (message) => {
  if (!message.passport.activated) {
    throw new Error('Bot not activated');
  }
  const document = new Document(message);
  await document.beginDialog();
};
