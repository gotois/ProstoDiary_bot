const bot = require('../core');
const logger = require('../services/logger.service');
const helpAPI = require('../api/v1/help');
/**
 * @param {object} msg - message
 * @param {object} msg.chat - chat
 * @returns {undefined}
 */
const onHelp = async ({ chat }) => {
  const chatId = chat.id;
  const helpResult = await helpAPI();
  try {
    await bot.sendMessage(chatId, helpResult, {
      parse_mode: 'Markdown',
    });
  } catch (error) {
    logger.error(error);
    // await bot.sendMessage(chatId, error.message);
  }
};

module.exports = onHelp;
