const bot = require('../core/bot');
const helpAPI = require('../api/v2/help');
const TelegramBotRequest = require('./telegram-bot-request');
/**
 * @param {TelegramMessage} message - message
 * @returns {Promise<undefined>}
 */
const onHelp = async (message) => {
  const help = new TelegramBotRequest(message, helpAPI);
  const helpResult = await help.request();
  await bot.sendMessage(message.chat.id, helpResult, {
    parse_mode: 'Markdown',
  });
};

module.exports = onHelp;
