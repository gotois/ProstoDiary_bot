module.exports = (t) => {
  const bot = require('../../src/bot');
  t.true(typeof bot === 'object');
};
