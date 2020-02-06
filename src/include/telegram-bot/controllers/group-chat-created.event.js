const logger = require('../../../services/logger.service');

/**
 * @description Создание чата
 * @param {TelegramMessage} message - msg
 * @returns {Promise<undefined>}
 */
module.exports = (message) => {
  logger.info(message);
};
