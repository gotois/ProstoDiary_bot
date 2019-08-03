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
  const { error, result } = await helpAPI();
  if (error) {
    logger.error(error);
    await bot.sendMessage(chatId, error.message);
    return;
  }
  await bot.sendMessage(chatId, result, {
    parse_mode: 'Markdown',
  });
};

module.exports = onHelp;
