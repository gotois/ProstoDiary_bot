const bot = require('../core');
const logger = require('../services/logger.service');
/**
 * @param  {object} chat - chat
 * @returns {Promise<undefined>}
 */
const getVersion = async ({ chat }) => {
  logger.log('info', getVersion.name);
  const chatId = chat.id;
  const versionAPI = require('../api/v1/version');
  const { error, result } = await versionAPI();
  if (error) {
    logger.error(error);
    await bot.sendMessage(chatId, error.message);
    return;
  }
  await bot.sendMessage(chatId, result);
};

module.exports = getVersion;
