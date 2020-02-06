const bot = require('../bot');
const backupMessage = require('../../../core/functions/backup');
const TelegramBotRequest = require('./telegram-bot-request');

class Backup extends TelegramBotRequest {
  /**
   * запрашиваем ключ от двухфакторной аутентификации
   *
   * @param {string} text - tfa token
   * @returns {Promise<void>}
   */
  async authReplyMessage({ text }) {
    const backupAction = backupMessage({
      token: text,
      date: this.message.date,
    });
    const result = await this.request('post', backupAction);
    await bot.sendMessage(this.message.chat.id, result);
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
 * @param {TelegramMessage} message - message
 * @returns {Promise<undefined>}
 */
module.exports = async (message) => {
  if (!message.passport.activated) {
    throw new Error('Bot not activated');
  }
  const backup = new Backup(message);
  await backup.beginDialog();
};
