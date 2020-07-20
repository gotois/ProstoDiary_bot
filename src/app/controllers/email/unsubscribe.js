const logger = require('../../../lib/log');

const unsubscribe = (info) => {
  // todo move to Haraka
  logger.info(info);
};

module.exports = unsubscribe;
