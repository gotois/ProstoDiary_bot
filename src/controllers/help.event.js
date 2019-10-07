const jsonrpc = require('jsonrpc-lite');
const bot = require('../core/bot');
const logger = require('../services/logger.service');
const helpAPI = require('../api/v2/help');
const TelegramBotRequest = require('./telegram-bot-request');

class Help extends TelegramBotRequest {
  constructor(message) {
    super(message);
    this.api = helpAPI;
  }
  async beginDialog() {
    logger.log('info', Help.name);
    const requestObject = jsonrpc.request('123', 'help');
    const result = await this.request(requestObject);
    await bot.sendMessage(this.message.chat.id, result, {
      parse_mode: 'Markdown',
    });
  }
}
/**
 * @param {TelegramMessage} message - message
 * @returns {Promise<undefined>}
 */
const onHelp = async (message) => {
  const help = new Help(message);
  await help.beginDialog();
};

module.exports = onHelp;
