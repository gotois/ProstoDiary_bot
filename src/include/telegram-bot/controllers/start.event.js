const fs = require('fs');
const bot = require('../../../include/telegram-bot/bot');
const TelegramBotRequest = require('./telegram-bot-request');

class Start extends TelegramBotRequest {
  constructor(message) {
    super(message);
    this.dialog = this.messageIterator();
  }
  async beginDialog() {
    if (this.message.passport.id) {
      const message =
        'Повторная установка не требуется\n\n' +
        '/signin - включить бота \n' +
        '/signout - выключить бота \n';
      await bot.sendMessage(this.message.chat.id, message);
      return;
    }
    await super.beginDialog();
    await this.dialog.next();
  }
  /**
   * @returns {IterableIterator}
   */
  *messageIterator() {
    // Выводим оферту
    const offerta = fs.readFileSync('docs/_pages/offerta.md').toString();
    yield bot.sendMessage(this.message.chat.id, offerta, {
      parse_mode: 'Markdown',
      disable_notification: true,
      reply_markup: {
        keyboard: [[{ text: 'Agree', request_contact: true }]],
        one_time_keyboard: true,
      },
    });
  }
}
/**
 * @param {TelegramMessage} message - message
 * @param {boolean} silent - silent dialog
 * @returns {Promise<undefined>}
 */
module.exports = async (message, silent) => {
  const start = new Start(message);
  await start.beginDialog(silent);
};
