const bot = require('../../core/bot');
const { client } = require('../../core/jsonrpc');
const logger = require('../../services/logger.service');

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
  /**
   * @returns {Array<string>}
   */
  get hashtags() {
    const hashtags = new Set();
    if (Array.isArray(this.message.entities)) {
      this.message.entities
        .filter((entity) => {
          return entity.type === 'hashtag';
        })
        .forEach((entity) => {
          // eslint-disable-next-line unicorn/prefer-string-slice
          const hashtag = this.message.text.substr(
            entity.offset + 1,
            entity.length - 1,
          );
          hashtags.add(hashtag);
        });
    }
    return [...hashtags];
  }
  async beginDialog() {
    const instanceProto = Object.getPrototypeOf(this);
    logger.info('telegram:' + instanceProto.constructor.name);
  }
  /**
   * @param {RequestObject|NotificationObject} requestObject - requestObject
   * @returns {Promise<*>}
   */
  async request(method, params = []) {
    logger.info('request:' + method);
    const { error, result } = await client.request(method, params);
    if (error) {
      this.onError(error);
      return error.message;
    }
    return result;
  }
  /**
   * @override
   */
  onError(error) {
    logger.error(error);
  }
}

module.exports = TelegramBotRequest;
