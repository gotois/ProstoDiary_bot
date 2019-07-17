const bot = require('../bot');
const logger = require('../services/logger.service');
const versionAPI = require('../api/v1/version');
/**
 * @param  {object} chat - chat
 * @returns {Promise<undefined>}
 */
const getVersion = async ({ chat }) => {
  logger.log('info', getVersion.name);
  const chatId = chat.id;
  const resultVersion = await versionAPI();
  await bot.sendMessage(chatId, resultVersion, {});
};

module.exports = getVersion;
