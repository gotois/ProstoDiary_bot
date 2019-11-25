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
    const { error, result } = await client.request(method, params);
    if (error) {
      logger.error(error);
      await this.onError(error);
    }
    // todo: каждый результат должен логироваться дневником (может подойдет обычный logger?)
    // const result = await this.request('post', {
    //   text: signInResult,
    //   mime: 'plain/text',
    //   date: this.message.date,
    //   creator: this.creator.email,
    //   publisher: pkg.author.email,
    //   telegram_message_id: this.message.message_id,
    // });
    return result;
  }
  async onError(error) {
    await bot.sendMessage(this.message.chat.id, error.message);
    throw error;
  }
}

module.exports = TelegramBotRequest;
