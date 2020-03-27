module.exports = (t) => {
  const logger = require('../../src/lib/log');
  t.is(typeof logger, 'object');
};
