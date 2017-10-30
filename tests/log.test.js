module.exports = function (t) {
  const logger = require('../src/services/logger.service');
  t.is(typeof logger, 'object');
};
