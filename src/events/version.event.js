const logger = require('../services/logger.service');
const { version } = require('../../package');
const bot = require('../bot');
const { IS_PRODUCTION } = require('../env');
/**
 *
 * @param  {Object} chat - chat
 * @returns {Promise<undefined>}
 */
const getVersion = async ({ chat }) => {
  logger.log('info', getVersion.name);
  const chatId = chat.id;
  let text = String(version);
  if (!IS_PRODUCTION) {
    text += ' - development';
  }
  await bot.sendMessage(chatId, text, {});
};

module.exports = getVersion;
