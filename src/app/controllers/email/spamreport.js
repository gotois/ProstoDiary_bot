const logger = require('../../../lib/log');

const spamReport = (info) => {
  // todo move to Haraka
  logger.info(info);
};

module.exports = spamReport;
