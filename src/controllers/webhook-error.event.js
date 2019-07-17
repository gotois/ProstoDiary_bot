const logger = require('../services/logger.service');

const webHookError = () => {
  logger.log('error', 'webHookError');
};

module.exports = webHookError;
