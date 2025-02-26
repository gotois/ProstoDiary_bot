const errorHandler = require('./error-handler.cjs');
const { getUsers } = require('../models/users.cjs');
const Dialog = require('../libs/dialog.cjs');

/**
 * @param {Function} callback - callback
 * @returns {(function(*, *): void)}
 */
module.exports = function (callback) {
  return async (bot, message) => {
    const { chat } = Array.isArray(message) ? message[0] : message;
    const [user] = getUsers(chat.id);
    if (!user) {
      await bot.sendMessage(chat.id, 'Пройдите авторизацию нажав /start', {
        parse_mode: 'MarkdownV2',
      });
      return;
    }
    // todo если использовать inline тогда
    if (message.via_bot) {
      console.log('WIP supports: ', message.via_bot);
    }
    await errorHandler(callback)(bot, message, Dialog.from(user));
  };
};
