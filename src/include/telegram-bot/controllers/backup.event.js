const backupAction = require('../../../core/functions/backup');
const TelegramBotRequest = require('./telegram-bot-request');

class Backup extends TelegramBotRequest {
  /**
   * запрашиваем ключ от двухфакторной аутентификации
   *
   * @param {string} text - tfa token
   * @returns {Promise<void>}
   */
  async authReplyMessage({ text }) {
    const result = await backupAction({
      token: text,
      date: this.message.date,
      jwt: this.message.passport.jwt,
    });
    await this.bot.sendMessage(this.message.chat.id, result);
  }
  async beginDialog(silent) {
    await super.beginDialog(silent);
    const authMessage = await this.bot.sendMessage(
      this.message.chat.id,
      'Введите ключ двухфакторной аутентификации',
      {
        parse_mode: 'Markdown',
        reply_markup: {
          force_reply: true,
        },
      },
    );
    this.bot.onReplyToMessage(
      this.message.chat.id,
      authMessage.message_id,
      this.authReplyMessage.bind(this),
    );
  }
}
/**
 * @description Скачивание файла БД на устройство
 * @param {TelegramMessage} message - message
 * @param {boolean} silent - silent dialog
 * @returns {Promise<undefined>}
 */
module.exports = async (message, silent) => {
  if (!message.passport.activated) {
    throw new Error('Bot not activated');
  }
  const backup = new Backup(message);
  await backup.beginDialog(silent);
};
