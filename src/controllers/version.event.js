const bot = require('../core/bot');
const logger = require('../services/logger.service');
const TelegramBotRequest = require('./telegram-bot-request');
const versionAPI = require('../api/v1/version');
/**
 * @param {TelegramMessage} message - message
 * @returns {Promise<undefined>}
 */
const getVersion = async (message) => {
  logger.log('info', getVersion.name);
  const version = new TelegramBotRequest(message, versionAPI);
  const versionResult = await version.request();
  await bot.sendMessage(message.chat.id, versionResult);
};

module.exports = getVersion;
