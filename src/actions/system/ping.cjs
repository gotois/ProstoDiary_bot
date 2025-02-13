const { SERVER } = require('../../environments/index.cjs');

/**
 * @description Проверка сети
 * @param {object} bot - telegram bot
 * @param {object} message - telegram message
 * @returns {Promise<void>}
 */
module.exports = async (bot, message) => {
  const response = await fetch(SERVER.HOST + '/ping', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Not ok');
  }
  const result = await response.text();
  return bot.sendMessage(message.chat.id, result, {
    parse_mode: 'MarkdownV2',
  });
};
