const Transport = require('winston-transport');
const TelegramNotifyError = require('../../core/models/errors/telegram-notify-error');

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
    const { document } = info.message;
    try {
      callback();
      setImmediate(() => {
        this.emit('logged', info);
      });
    } catch (error) {
      const telegramMessageId = document.object.mainEntity.find((entity) => {
        return entity.name === 'TelegramMessageId';
      })['value'];
      const telegramChatId = document.object.mainEntity.find((entity) => {
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
