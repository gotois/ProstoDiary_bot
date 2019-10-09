// todo: https://github.com/gotois/ProstoDiary_bot/issues/39
const bot = require('../core/bot');
const logger = require('../services/logger.service');
const balanceAPI = require('../api/v2/balance');
const TelegramBotRequest = require('./telegram-bot-request');

class Balance extends TelegramBotRequest {
  constructor(message) {
    super(message);
    this.api = balanceAPI;
  }
  async beginDialog() {
    logger.log('info', Balance.name);
    const balanceResult = await balanceAPI();
    await bot.sendMessage(this.message.chat.id, balanceResult, {
      parse_mode: 'Markdown',
    });
  }
}
/**
 * @function
 * @param {TelegramMessage} message - message
 * @returns {Promise<undefined>}
 */
const onBalance = async (message) => {
  const balance = new Balance(message);
  await balance.beginDialog();
};

module.exports = onBalance;
