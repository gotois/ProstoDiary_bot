const fs = require('fs');
const qs = require('qs');
const bot = require('../../core/bot');
const { SERVER, IS_PRODUCTION } = require('../../environment');
const logger = require('../../services/logger.service');
const TelegramBotRequest = require('./telegram-bot-request');

class Start extends TelegramBotRequest {
  constructor(message) {
    super(message);
    this.dialog = this.messageIterator();
    this.messageListener = this.messageListener.bind(this);
  }
  async beginDialog() {
    if (this.message.gotois.id) {
      const message =
        'Повторная установка не требуется\n\n' +
        '/signin - включить бота \n' +
        '/signout - выключить бота \n';
      await bot.sendMessage(this.message.chat.id, message);
      return;
    }
    bot.on('callback_query', this.messageListener);
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
        logger.info('start.cancel');
        await bot.sendMessage(
          this.message.chat.id,
          'Попробовать сначала /start',
        );
        bot.off('callback_query', this.messageListener);
        break;
      }
      case 'AGREE': {
        logger.info('start.agree');
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
    // TODO: эти данные лучше не передавать на сторонний сервер.
    //  Лучше использовать какой-то безобидный id -
    //  например id текущей сессии, которая после колбэка будет уничтожаться в oauth.js
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
              {
                text: 'Yandex',
                url: `${SERVER.HOST}/connect/yandex?${callbackValues}`,
              },
              {
                text: 'Facebook',
                url: `${SERVER.HOST}/connect/facebook?${callbackValues}`,
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
 * @returns {Promise<undefined>}
 */
module.exports = async (message) => {
  const start = new Start(message);
  await start.beginDialog();
};
