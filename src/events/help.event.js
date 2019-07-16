const bot = require('../bot');
const helpAPI = require('../api/v1/help');
/**
 * @param {object} msg - message
 * @param {object} msg.chat - chat
 * @returns {undefined}
 */
const onHelp = async ({ chat }) => {
  const chatId = chat.id;
  const helpResult = await helpAPI();
  await bot.sendMessage(chatId, helpResult, {
    parse_mode: 'Markdown',
  });
};

module.exports = onHelp;
