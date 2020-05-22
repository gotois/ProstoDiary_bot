const fs = require('fs');
const bot = require('../../../include/telegram-bot/bot');
const TelegramBotRequest = require('./telegram-bot-request');
const TelegramMessage = require('../models/telegram-bot-message');

class Start extends TelegramBotRequest {
  constructor(message) {
    super(message);
    this.dialog = this.messageIterator();
  }
  async beginDialog(silent) {
    if (this.message.passports.length > 0) {
      const message = 'Повторная установка не требуется\n\n' + '/help - помощь';
      await bot.sendMessage(this.message.chat.id, message);
      return;
    }
    await super.beginDialog(silent);
    await this.dialog.next();
  }
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
