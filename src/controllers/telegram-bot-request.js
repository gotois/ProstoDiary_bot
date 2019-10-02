const logger = require('../services/logger.service');
const bot = require('../core/bot');

class TelegramBotRequest {
  #message;
  #api;
  constructor(message, api) {
    this.#message = message;
    this.#api = api;
  }
  get message() {
    return this.#message;
  }
  async request() {
    const { error, result } = await this.#api(this.message.text, this.message.from.id);
    
    // todo: оборачивать ответ в jsonrpc ответ
    // ...
    
    if (error) {
      logger.error(error);
      await bot.sendMessage(this.message.chat.id, error.message);
      throw error;
    }
    return result;
  }
}

module.exports = TelegramBotRequest;
