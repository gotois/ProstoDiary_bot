const logger = require('../../services/logger.service');

const processed = () => {
  logger.info(processed.name);
};

module.exports = processed;
