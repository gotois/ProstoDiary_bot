const TelegramBotRequest = require('./telegram-bot-request');
const TelegramMessage = require('../models/telegram-bot-message');
const {AbstractCommand} = require('vzor'); // fixme

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
    const backupAction = new AbstractCommand(
      {
        startTime: this.message.date,
        subjectOf: [
          {
            '@type': 'CreativeWork',
            'name': 'token',
            'abstract': text,
            'encodingFormat': 'text/plain',
            // еще может потребоваться поле dateCreated - которое будет детектировать когда этот токен пришел чтобы его лучше детектить
          },
          {
            '@type': 'CreativeWork',
            'name': 'sorting',
            'abstract': 'Ascending',
            'encodingFormat': 'text/plain',
          },
        ],
      },
    );
    await backupAction.prepare();

    const jsonldRequest = await backupAction.context({
      creator: this.creator,
      publisher: this.publisher,
      telegram: this.chatData,
    });
    await this.rpc(jsonldRequest);
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
