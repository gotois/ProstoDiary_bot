const logger = require('../../../services/logger.service');

/**
 * @description Добавление нового участника в чат
 * @param {TelegramMessage} message - msg
 * @returns {Promise<undefined>}
 */
module.exports = (message) => {
  logger.info(message);
};
