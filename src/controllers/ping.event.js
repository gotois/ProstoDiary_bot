const jsonrpc = require('jsonrpc-lite');
const bot = require('../core/bot');
const logger = require('../services/logger.service');
const TelegramBotRequest = require('./telegram-bot-request');
const pingAPI = require('../api/v2/ping');

class Ping extends TelegramBotRequest {
  constructor(message) {
    super(message);
    this.api = pingAPI;
  }
  async beginDialog() {
    logger.log('info', Ping.name);
    const requestObject = jsonrpc.request('123', 'ping');
    const result = await this.request(requestObject);
    await bot.sendMessage(this.message.chat.id, result);
  }
}
/**
 * @param {TelegramMessage} message - message
 * @returns {Promise<undefined>}
 */
const onPing = async (message) => {
  const ping = new Ping(message);
  await ping.beginDialog();
};

module.exports = onPing;
