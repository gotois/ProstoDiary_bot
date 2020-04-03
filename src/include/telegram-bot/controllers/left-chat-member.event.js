const logger = require('../../../lib/log');
/**
 * @param {TelegramMessage} message - msg
 * @returns {Promise<undefined>}
 */
module.exports = (message) => {
  logger.info(message);
  console.warn('здесь надо удалять бота из числа ассистентов чатов');
};
