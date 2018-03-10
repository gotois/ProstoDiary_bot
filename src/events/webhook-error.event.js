const logger = require('../services/logger.service');

const webHookError = async () => {
  logger.log('error', 'webHookError');
};

module.exports = webHookError;
