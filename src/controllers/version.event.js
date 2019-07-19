const bot = require('../bot');
const logger = require('../services/logger.service');
/**
 * @param  {object} chat - chat
 * @returns {Promise<undefined>}
 */
const getVersion = async ({ chat }) => {
  logger.log('info', getVersion.name);
  const chatId = chat.id;
  const versionAPI = require('../api/v1/version');
  try {
    const resultVersion = await versionAPI();
    await bot.sendMessage(chatId, resultVersion);
  } catch (error) {
    logger.error(error);
    await bot.sendMessage(chatId, error.message());
  }
};

module.exports = getVersion;
