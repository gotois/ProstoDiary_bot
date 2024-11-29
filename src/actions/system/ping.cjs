const { SERVER_HOST } = require('../../environments/index.cjs');

/**
 * Проверка сети
 * @param {object} bot - telegram bot
 * @param {object} message - telegram message
 * @returns {Promise<void>}
 */
module.exports = async (bot, message) => {
  try {
    const response = await fetch(SERVER_HOST + '/ping', {
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
  } catch (error) {
    return bot.sendMessage(message.chat.id, error.message, {
      parse_mode: 'MarkdownV2',
    });
  }
};
