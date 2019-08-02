module.exports = (t) => {
  const bot = require('../../src/core');
  t.true(typeof bot === 'object');
  t.true(typeof bot.setWebHook === 'function');
};
