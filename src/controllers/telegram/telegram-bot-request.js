const logger = require('../../services/logger.service');
const bot = require('../../core/bot');
const { client } = require('../../core/jsonrpc');

class TelegramBotRequest {
  #message;
  /**
   * @param {TelegramMessage} message - message
   */
  constructor(message) {
    this.#message = message;
  }
  get message() {
    return this.#message;
  }
  async beginDialog() {
    const instanceProto = Object.getPrototypeOf(this);
    logger.log('info', instanceProto.constructor.name);
  }
  /**
   * @param {RequestObject|NotificationObject} requestObject - requestObject
   * @returns {Promise<*>}
   */
  async request(method, params = []) {
    logger.info('request:' + method);
    const { error, result } = await client.request(method, params);
    if (error) {
      logger.error(error);
      await this.onError(error);
    }
    return result;
  }
  async onError(error) {
    await bot.sendMessage(this.message.chat.id, error.message);
    throw error;
  }
}

module.exports = TelegramBotRequest;
