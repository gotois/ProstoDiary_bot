const bot = require('../core');
const pingAPI = require('../api/v1/ping');
/**
 * @param  {object} chat - chat
 * @returns {Promise<undefined>}
 */
const onPing = async ({ chat }) => {
  const chatId = chat.id;
  const { result } = pingAPI();
  await bot.sendMessage(chatId, result);
};

module.exports = onPing;
