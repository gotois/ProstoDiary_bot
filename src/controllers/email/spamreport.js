const logger = require('../../services/logger.service');

const spamReport = (info) => {
  logger.info(info);
};

module.exports = spamReport;
