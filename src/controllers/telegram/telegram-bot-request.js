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
   * @param {jsonld} document - jsonld params
   * @returns {Promise<string>}
   */
  async request(method, document = {}) {
    logger.info('request:' + method);
    try {
      const jsonldMessage = await jsonrpc.rpcRequest(method, document, this.message.passport);
      return jsonldMessage;
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
