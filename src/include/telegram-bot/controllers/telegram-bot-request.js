const crypto = require('crypto');
const requestService = require('../../../services/request.service');
const logger = require('../../../services/logger.service');
const { SERVER } = require('../../../environment');

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
      const jsonldMessage = await requestService.rpc({
        url: SERVER.HOST + '/api',
        body: {
          jsonrpc: '2.0',
          method: method,
          id: 1,
          params: document
        },
        auth: {
          user: this.message.passport.user,
          pass:this.message.passport.masterPassword,
        }
      });
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
