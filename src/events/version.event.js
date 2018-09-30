const logger = require('../services/logger.service');
const {version} = require('../../package');
const bot = require('../config');
/**
 *
 * @param chat {Object}
 * @returns {Promise<undefined>}
 */
const getVersion = async ({chat}) => {
  logger.log('info', getVersion.name);
  const chatId = chat.id;
  await bot.sendMessage(chatId, version, {});
};

module.exports = getVersion;
