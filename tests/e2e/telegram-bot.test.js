module.exports = (t) => {
  const bot = require('../../src/include/telegram-bot/bot');
  t.true(typeof bot === 'object');
  t.true(typeof bot.setWebHook === 'function');
};
