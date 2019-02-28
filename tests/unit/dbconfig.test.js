module.exports = (t) => {
  const dbConfig = require('../../src/env/index');
  t.is(typeof dbConfig, 'object');
};
