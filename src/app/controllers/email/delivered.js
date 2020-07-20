const logger = require('../../../lib/log');

const delivered = (info) => {
  // todo move to Haraka
  logger.info(info);
};

module.exports = delivered;
