const bot = require('../../core/bot');
const TelegramBotRequest = require('./telegram-bot-request');

class Backup extends TelegramBotRequest {
  // запрашиваем ключ от двухфакторной аутентификации
  async authReplyMessage({ text }) {
    const { filename, fileBuffer } = await this.request('backup', {
      user: this.creator.telegram,
      passcode: this.creator.passcode,
      token: text,
      date: this.message.date,
    });
    await bot.sendDocument(
      this.message.chat.id,
      fileBuffer,
      {
        caption: filename,
      },
      {
        filename: filename + '.zip',
        contentType: 'application/zip',
      },
    );
  }
  async beginDialog() {
    await super.beginDialog();
    const authMessage = await bot.sendMessage(
      this.message.chat.id,
      'Введите ключ двухфакторной аутентификации',
      {
        parse_mode: 'Markdown',
        reply_markup: {
          force_reply: true,
        },
      },
    );
    bot.onReplyToMessage(
      this.message.chat.id,
      authMessage.message_id,
      this.authReplyMessage.bind(this),
    );
  }
}
/**
 * @description Скачивание файла БД на устройство
 * @todo https://github.com/gotois/ProstoDiary_bot/issues/162
 * @param {TelegramMessage} message - message
 * @returns {Promise<undefined>}
 */
module.exports = async (message) => {
  const backup = new Backup(message);
  await backup.beginDialog();
};
