const bot = require('../bot');
const sessions = require('../services/session.service');
const logger = require('../services/logger.service');
const plotAPI = require('../api/v1/plot');
/**
 * Построить график
 *
 * @todo rename -> getPlot
 * @param {object} msg - message
 * @param {object} msg.chat - message chat
 * @param {object} msg.from - from
 * @param {string} msg.text - text
 * @returns {undefined}
 */
const getGraph = async ({ chat, from, text }) => {
  logger.log('info', getGraph.name);
  const chatId = chat.id;
  const currentUser = sessions.getSession(from.id);
  try {
    const { photoBuffer, options } = await plotAPI(text, currentUser);
    await bot.sendPhoto(chatId, photoBuffer, options);
  } catch (error) {
    logger.log('error', error.toString());
    await bot.sendMessage(chatId, error);
  }
};

module.exports = getGraph;
