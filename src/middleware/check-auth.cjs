const errorHandler = require('./error-handler.cjs');

/**
 * @param {Function} callback - callback
 * @returns {(function(*, *): void)}
 */
module.exports = function (callback) {
  return async (bot, message) => {
    if (!message.user?.jwt) {
      await bot.sendMessage(message.chat.id, 'Требуется авторизация /start');
      return;
    }
    if (message.user?.expired_at && message.user.expired_at < Date.now() / 1000) {
      await bot.sendMessage(message.chat.id, 'Пройдите авторизацию заново /start');
      return;
    }

    // todo если использовать inline тогда
    if (message.via_bot) {
      console.log('WIP supports: ', message.via_bot);
    }

    await errorHandler(callback)(bot, message);
  };
};
