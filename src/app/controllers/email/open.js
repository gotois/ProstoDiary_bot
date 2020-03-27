const logger = require('../../../services/logger.service');

const open = (info) => {
  logger.info(info);
};

module.exports = open;
