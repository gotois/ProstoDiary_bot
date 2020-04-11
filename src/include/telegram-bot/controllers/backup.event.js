const backupAction = require('../../../core/functions/backup');
const TelegramBotRequest = require('./telegram-bot-request');

class Backup extends TelegramBotRequest {
  constructor(message) {
    super(message);
    this.method = 'backup';
  }
  /**
   * запрашиваем ключ от двухфакторной аутентификации
   *
   * @param {string} text - tfa token
   * @returns {Promise<void>}
   */
  async authReplyMessage({ text }) {
    const jsonldAction = await backupAction({
      token: text,
      date: this.message.date,
      creator: this.creator,
      publisher: this.publisher,
      telegram: {
        title: this.message.chat.title,
        chatId: this.message.chat.id,
      },
    });
    await this.rpc(jsonldAction);
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
  const backup = new Backup(message);
  await backup.beginDialog(silent);
};
