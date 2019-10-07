const logger = require('../services/logger.service');
const bot = require('../core/bot');

class TelegramBotRequest {
  #message;
  #api;
  constructor(message, api) {
    this.#message = message;
    if (api) {
      this.api = api;
    }
  }
  get message() {
    return this.#message;
  }
  set api(api) {
    this.#api = api;
  }
  get api() {
    return this.#api;
  }
  /**
   * @param {RequestObject} requestObject - requestObject
   * @returns {Promise<*>}
   */
  async request(requestObject) {
    const { error, result } = await this.#api(requestObject);
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
