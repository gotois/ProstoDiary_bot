const bot = require('../bot');
const logger = require('../services/logger.service');
const kppService = require('../services/kpp.service');
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
    const kppData = await kppService(input);
    await bot.sendMessage(chatId, JSON.stringify(kppData));
  } catch (error) {
    await bot.sendMessage(chatId, error.toString());
  }
};

module.exports = onKPP;
