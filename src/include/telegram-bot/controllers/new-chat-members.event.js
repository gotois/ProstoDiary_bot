const logger = require('../../../lib/log');
/**
 * @description Добавление нового участника в чат
 * @param {TelegramMessage} message - msg
 * @returns {Promise<undefined>}
 */
module.exports = (message) => {
  logger.info(message);
};
