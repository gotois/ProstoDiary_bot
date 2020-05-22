const TelegramMessage = require('../models/telegram-bot-message');
const logger = require('../../../lib/log');
/**
 * @description Создание чата
 * @param {TelegramMessage} message - msg
 */
module.exports = (message) => {
  logger.info(message);
};
