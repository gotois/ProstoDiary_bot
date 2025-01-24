const { getUsers } = require('../libs/database.cjs');

module.exports = function (callback) {
  return async (bot, message) => {
    const message_ = Array.isArray(message) ? message[0] : message;
    const users = getUsers(message_.chat.id);
    if (users.length === 0) {
      await bot.sendMessage(message_.chat.id, 'Пройдите авторизацию нажав /start', {
        parse_mode: 'MarkdownV2',
      });
      return;
    }
    callback(bot, message, users[0]);
  };
};
