const bot = require('../core');
const logger = require('../services/logger.service');
const kppAPI = require('../api/v1/kpp');
/**
 * @param {object} msg - message
 * @param {object} msg.chat - message chat
 * @param {Array} match - matcher
 * @returns {undefined}
 */
const onKPP = async ({ chat }, match) => {
  logger.log('info', onKPP.name);
  const chatId = chat.id;
  const input = String(match[2]).trim();
  try {
    const kppResult = await kppAPI(input);
    await bot.sendMessage(chatId, kppResult);
  } catch (error) {
    logger.error(error);
    await bot.sendMessage(chatId, error.toString());
  }
};

module.exports = onKPP;
