const errorHandler = require('./error-handler.cjs');
const { getUsers } = require('../libs/database.cjs');

/**
 * @param {Function} callback - callback
 * @returns {(function(*, *): void)}
 */
module.exports = function (callback) {
  return (bot, message) => {
    const { chat } = Array.isArray(message) ? message[0] : message;
    const [user] = getUsers(chat.id);
    if (!user) {
      bot.sendMessage(chat.id, 'Пройдите авторизацию нажав /start', {
        parse_mode: 'MarkdownV2',
      });
      return;
    }
    user.timezone = user.timezone ?? 'UTC';
    errorHandler(callback)(bot, message, user);
  };
};
