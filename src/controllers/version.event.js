const jsonrpc = require('jsonrpc-lite');
const bot = require('../core/bot');
const logger = require('../services/logger.service');
const TelegramBotRequest = require('./telegram-bot-request');
const versionAPI = require('../api/v2/version');

class Version extends TelegramBotRequest {
  constructor(message) {
    super(message);
    this.api = versionAPI;
  }
  async beginDialog() {
    logger.log('info', Version.name);
    const requestObject = jsonrpc.request('123', 'version');
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
const onVersion = async (message) => {
  const version = new Version(message);
  await version.beginDialog();
};

module.exports = onVersion;
