const TelegramMessage = require('../models/telegram-bot-message');
const logger = require('../../../lib/log');
/**
 * @param {TelegramMessage} message - msg
 * @returns {Promise<undefined>}
 */
module.exports = (message) => {
  logger.info(message);
  // todo здесь надо удалять бота из числа ассистентов чатов
  return undefined;
};
