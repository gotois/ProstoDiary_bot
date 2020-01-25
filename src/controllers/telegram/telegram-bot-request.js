const crypto = require('crypto');
const jsonrpc = require('../../core/jsonrpc');
const logger = require('../../services/logger.service');

class TelegramBotRequest {
  #message;
  /**
   * @param {TelegramMessage} message - message
   */
  constructor(message) {
    this.#message = message;
    this.userHash = crypto.createHash('md5').update(String(message.from.id)).digest("hex");
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
   * @param {string} method - api method
   * @param {array} params - api params
   * @returns {Promise<string>}
   */
  async request(method, params = []) {
    logger.info('request:' + method);
    try {
      const message = await jsonrpc.rpcRequest(method, params, this.message.passport);
      return message;
    } catch (error) {
      this.onError(error);
      return error.message;
    }
  }
  /**
   * @override
   */
  onError(error) {
    logger.error(error);
  }
}

module.exports = TelegramBotRequest;
