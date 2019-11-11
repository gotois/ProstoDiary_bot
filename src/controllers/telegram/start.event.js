const fs = require('fs');
const qs = require('qs');
const bot = require('../../core/bot');
const { SERVER, IS_PRODUCTION } = require('../../environment');
const TelegramBotRequest = require('./telegram-bot-request');

class Start extends TelegramBotRequest {
  constructor(message, session) {
    super(message, session);
    this.dialog = this.messageIterator();
    this.messageListener = this.messageListener.bind(this);
    bot.on('callback_query', this.messageListener);
  }
  async beginDialog() {
    if (this.creator) {
      // для ускорения разработки вынес под флаг
      if (IS_PRODUCTION) {
        await bot.sendMessage(
          this.message.chat.id,
          'Повторная установка не требуется',
        );
        return;
      }
    }
    await super.beginDialog();
    await this.dialog.next();
  }
  /**
   * @param {object} query - query data
   * @returns {Promise<void>}
   */
  async messageListener(query) {
    switch (query.data) {
      case 'CANCEL': {
        await bot.sendMessage(this.message.chat.id, 'Попробовать сначала /start');
        bot.off('callback_query', this.messageListener);
        break;
      }
      case 'AGREE': {
        await this.dialog.next().value;
        break;
      }
      default: {
        break;
      }
    }
  }
  /**
   * @returns {IterableIterator}
   */
  *messageIterator() {
    // Выводим оферту. Для ускорения, работает только в продакшен окружении
    if (IS_PRODUCTION) {
      const offerta = fs.readFileSync('docs/_pages/offerta.md').toString();
      yield bot.sendMessage(this.message.chat.id, offerta, {
        parse_mode: 'Markdown',
        reply_markup: {
          force_reply: true,
          inline_keyboard: [
            [
              { text: 'Принимаю', callback_data: 'AGREE' },
              { text: 'Отмена', callback_data: 'CANCEL' },
            ],
          ],
        },
      });
    }
    const callbackValues = qs.stringify({
      telegram: {
        ...this.message,
      },
    });
    yield bot.sendMessage(
      this.message.chat.id,
      'Выберите способ авторизации: ' +
        `\n${SERVER.HOST}/connect/yandex?${callbackValues}`, // todo debug
      {
        parse_mode: 'HTML',
        reply_markup: {
          force_reply: true,
          inline_keyboard: [
            [
              // todo: добавить facebook
              //  ...
              {
                text: 'Yandex',
                url: `${SERVER.HOST}/connect/yandex?${callbackValues}`,
              },
            ],
          ],
        },
      },
    );
  }
}
/**
 * @param {TelegramMessage} message - message
 * @returns {undefined}
 */
module.exports = async (message, session) => {
  const start = new Start(message, session);
  await start.beginDialog();
};
