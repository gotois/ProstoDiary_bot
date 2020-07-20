const logger = require('../../../lib/log');

const open = (info) => {
  // todo move to Haraka
  logger.info(info);
};

module.exports = open;
