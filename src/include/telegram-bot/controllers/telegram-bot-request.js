const crypto = require('crypto');
const bot = require('../bot');
const logger = require('../../../lib/log');
const { rpc, get } = require('../../../services/request.service');

class TelegramBotRequest {
  #message;
  /**
   * @param {TelegramMessage} message - message
   */
  constructor(message) {
    this.bot = bot;
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
    logger.info('telegram: ' + instanceProto.constructor.name);
  }
  /**
   * @param {string} fileId - file id
   * @returns {Promise<Buffer>}
   */
  async getTelegramFile(fileId) {
    /**
     * @type {string}
     */
    const TELEGRAM_HOST = 'api.telegram.org';
    const fileInfo = await bot.getFile(fileId);
    const buffer = await get(
      `https://${TELEGRAM_HOST}/file/bot${bot.token}/${fileInfo.file_path}`,
    );
    return buffer;
  }
  async rpc(action) {
    const jsonldMessage = await rpc({
      body: {
        jsonrpc: '2.0',
        method: this.method,
        id: 1,
        params: action.context,
      },
      jwt: this.message.passport.jwt,
    });
    return jsonldMessage;
  }
}

module.exports = TelegramBotRequest;
