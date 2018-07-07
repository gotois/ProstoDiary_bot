module.exports = t => {
  const dbConfig = require('../src/env');
  t.is(typeof dbConfig, 'object');
};
