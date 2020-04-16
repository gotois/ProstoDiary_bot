const { v1: uuidv1 } = require('uuid');
const crypto = require('crypto');
const { Ed25519KeyPair } = require('crypto-ld');
const bot = require('../bot');
const logger = require('../../../lib/log');
const { IS_AVA_OR_CI, IS_AVA } = require('../../../environment');
const { rpc, get } = require('../../../services/request.service');
const linkedDataSignature = require('../../../services/linked-data-signature.service');

class TelegramBotRequest {
  #message;
  /**
   * @type {string}
   */
  static TELEGRAM_HOST = 'api.telegram.org';
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
  get marketplace() {
    return this.#message.marketplace;
  }
  // todo для чатов возможно предстоит делать отдачу всех ассистентов указанных в паспорте
  get creator() {
    return this.#message.passport[0].assistant;
  }
  // todo для чатов возможно предстоит делать отдачу всей почты боты указанных в паспорте?
  get publisher() {
    return this.#message.passport[0].email;
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
  async beginDialog(silent) {
    const instanceProto = Object.getPrototypeOf(this);
    logger.info('telegram: ' + instanceProto.constructor.name);
    if (!silent && !IS_AVA_OR_CI) {
      await this.bot.sendChatAction(this.message.chat.id, 'typing');
    }
  }
  /**
   * @param {string} fileId - file id
   * @returns {Promise<Buffer>}
   */
  async getTelegramFile(fileId) {
    const fileInfo = await this.bot.getFile(fileId);
    const buffer = await get(
      `https://${TelegramBotRequest.TELEGRAM_HOST}/file/bot${this.bot.token}/${fileInfo.file_path}`,
    );
    return buffer;
  }
  /**
   * Бродкаст всех сообщений по паспортам ботов по API
   *
   * @param {Action} action - action
   * @returns {Promise<*>}
   */
  async rpc(action) {
    if (!this.method) {
      throw new Error('Empty method');
    }
    const keyPare = await Ed25519KeyPair.from({
      privateKeyBase58: this.message.assistant.private_key,
      publicKeyBase58: this.message.assistant.public_key,
    });
    // todo убрать хардкод 'tg'
    const verificationMethod = 'https://gotointeractive.com/marketplace/tg/keys/' + this.message.assistant.id;
    // Подписываем переданный документ ключом ассистента
    const document = await linkedDataSignature.signDocument(
      action.context,
      keyPare,
      verificationMethod,
    );
    await rpc({
      body: {
        jsonrpc: '2.0',
        id: uuidv1(),
        method: this.method,
        params: document,
      },
      jwt: this.message.assistant.token,
      verification: verificationMethod
    });

    // hack специальный вызов для тестирования E2E. Без явного ответа sendMessage возникает ошибка SubError
    if (IS_AVA) {
      await this.bot.sendMessage(this.message.chat.id, jsonldMessage.purpose.abstract);
    }
  }
}

module.exports = TelegramBotRequest;
