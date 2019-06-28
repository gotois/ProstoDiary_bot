const bot = require('../bot');
const logger = require('../services/logger.service');
const { projectVersion, getCheckSum } = require('../services/version.service');
const { IS_PRODUCTION } = require('../env');
/**
 * @param  {object} chat - chat
 * @returns {Promise<undefined>}
 */
const getVersion = async ({ chat }) => {
  logger.log('info', getVersion.name);
  const chatId = chat.id;
  let text = '';
  text += projectVersion;
  if (!IS_PRODUCTION) {
    text += ' - development';
  }
  text += ' ' + getCheckSum();
  await bot.sendMessage(chatId, text, {});
};

module.exports = getVersion;
