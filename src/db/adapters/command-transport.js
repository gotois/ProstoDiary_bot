const Transport = require('winston-transport');
const TelegramNotifyError = require('../../core/models/errors/telegram-notify-error');
const Notifier = require('../../lib/notifier');

module.exports = class CommandTransport extends Transport {
  constructor(options) {
    super(options);
  }
  /**
   * @param {object} info - info
   * @param {Function} callback - callback
   * @returns {Promise<void>}
   */
  log(info, callback) {
    this.emit('pre-logged', {});
    const { document } = info.message;
    try {
      callback();
      setImmediate(() => {
        const { document } = info.message;
        switch (document.agent.email) {
          case 'tg@gotointeractive.com': {
            const notifyObject = Notifier.convertToTelegramNotifyObject(
              document,
            );
            this.emit('tg-logged', notifyObject);
            break;
          }
          default: {
            throw new Error('Unknown agent');
          }
        }
      });
    } catch (error) {
      // todo создать отдельный emit с ошибкой
      const telegramMessageId = document.object[0].mainEntity.find((entity) => {
        return entity.name === 'TelegramMessageId';
      })['value'];
      const telegramChatId = document.object[0].mainEntity.find((entity) => {
        return entity.name === 'TelegramChatId';
      })['value'];
      callback(
        new TelegramNotifyError(
          error.message,
          telegramMessageId,
          telegramChatId,
        ),
      );
    }
  }
};
