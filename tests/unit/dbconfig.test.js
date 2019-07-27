module.exports = (t) => {
  const dbConfig = require('../../src/environment');
  t.is(typeof dbConfig, 'object');
};
