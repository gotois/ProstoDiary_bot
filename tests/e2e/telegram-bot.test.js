module.exports = (t) => {
  const bot = require('../../src/core/bot');
  t.true(typeof bot === 'object');
  t.true(typeof bot.setWebHook === 'function');
};
