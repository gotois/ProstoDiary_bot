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
    this.userHash = crypto.createHash('md5').update(String(message.from.id)).digest('hex');
  }
  get message() {
    return this.#message;
  }
  get assistants() {
    return this.message.assistants;
  }
  // todo для чатов возможно предстоит делать отдачу всех ассистентов указанных в паспорте
  // выдача ассистента вида tg@gotointeractive.com
  get creator() {
    return this.assistants[0];
  }
  // todo для чатов возможно предстоит делать отдачу всей почты боты указанных в паспорте?
  // выдача бота вида user-bot@gotointeractive.com
  get publisher() {
    return this.#message.passports[0].email;
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
  get chatData () {
    if (this.message.forward_from) {
      return {
        title: this.message.forward_from.username,
        chatId: this.message.chat.id,
        messageId: this.message.message_id,
      }
    }
    return {
      title: this.message.chat.title,
      chatId: this.message.chat.id,
      messageId: this.message.message_id,
    }
  }
  /**
   * @param {boolean} silent - silent
   * @return {Promise<void>}
   */
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
   * @param {jsonldApiRequest} document - JSON-LD Request
   * @returns {Promise<object|Error>}
   */
  rpc(document) {
    logger.info('telegram-bot-request:rpc');
    if (!this.method) {
      throw new Error('Empty method');
    }
    this.assistants.forEach(async (assistant) => {
      const keyPare = await Ed25519KeyPair.from({
        privateKeyBase58: assistant.private_key,
        publicKeyBase58: assistant.public_key,
      });
      const verificationMethod = `https://gotointeractive.com/marketplace/${assistant.name}/keys/` + assistant.id;
      // Подписываем переданный документ ключом ассистента
      const signedDocument = await linkedDataSignature.signDocument(
        document,
        keyPare,
        verificationMethod,
      );
      await rpc({
        body: {
          jsonrpc: '2.0',
          id: uuidv1(),
          method: this.method,
          params: signedDocument,
        },
        jwt: assistant.token,
        verification: verificationMethod
      });
    });
    // hack специальный вызов для тестирования E2E. Без явного ответа sendMessage возникает ошибка SubError
    if (IS_AVA) {
      return this.bot.sendMessage(this.message.chat.id, jsonldMessage.purpose.abstract);
    }
  }
}

module.exports = TelegramBotRequest;
