const logger = require('../../../lib/log');
/**
 * @description Создание чата
 * @param {TelegramMessage} message - msg
 * @returns {Promise<undefined>}
 */
module.exports = (message) => {
  logger.info(message);
};
