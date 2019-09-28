const bot = require('../core/bot');
const logger = require('../services/logger.service');
/**
 * Построить график
 *
 * @param {object} msg - message
 * @param {object} msg.chat - message chat
 * @param {object} msg.from - from
 * @param {string} msg.text - text
 * @returns {undefined}
 */
const getPlot = async ({ chat, from, text }) => {
  logger.log('info', getPlot.name);
  const chatId = chat.id;
  const plotAPI = require('../api/v1/plot');
  try {
    const { photoBuffer, options } = await plotAPI(text, from.id);
    await bot.sendPhoto(chatId, photoBuffer, options);
  } catch (error) {
    logger.error('error', error);
    await bot.sendMessage(chatId, error.toString());
  }
};

module.exports = getPlot;
