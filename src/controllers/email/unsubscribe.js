const logger = require('../../services/logger.service');

const unsubscribe = (info) => {
  logger.info(info);
};

module.exports = unsubscribe;
