const bot = require('../core/bot');
const TelegramBotRequest = require('./telegram-bot-request');
const pingAPI = require('../api/v1/ping');
/**
 * @param {TelegramMessage} message - message
 * @returns {Promise<undefined>}
 */
const onPing = async (message) => {
  const ping = new TelegramBotRequest(message, pingAPI);
  const pingResult = await ping.request();
  await bot.sendMessage(message.chat.id, pingResult);
};

module.exports = onPing;
