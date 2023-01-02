const { v1: uuidv1 } = require('uuid');
const crypto = require('crypto');
const { Ed25519KeyPair } = require('crypto-ld');
const logger = require('../../../lib/log');
const linkedDataSignature = require('../../../services/linked-data-signature.service');

class TelegramBotRequest {
  #message;
  /**
   * @param {TelegramMessage} message - message
   */
  constructor(message) {
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
   * @param {Array<object>} entities - entities object
   * @param {string} text - caption or text
   * @returns {Array<string>}
   */
  getHashtagsFromEntities(entities, text) {
    return entities
      .filter((entity) => {
        return entity.type === 'hashtag';
      })
      .map(entity => {
        // eslint-disable-next-line unicorn/prefer-string-slice
        const hashtag = text.substr(
          entity.offset + 1,
          entity.length - 1,
        );
        return hashtag;
      });
  }
  /**
   * @returns {Array<string>}
   */
  get hashtags() {
    const hashtags = new Set();
    // caption entities
    if (Array.isArray(this.message.caption_entities)) {
      this.getHashtagsFromEntities(this.message.caption_entities, this.message.caption).forEach((hashtag) => {
        hashtags.add(hashtag);
      });
    }
    // entities
    if (Array.isArray(this.message.entities)) {
      this.getHashtagsFromEntities(this.message.entities, this.message.text).forEach((hashtag) => {
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
  }
  /**
   * @deprecated
   * Бродкаст всех сообщений по паспортам ботов по API
   *
   * @param {jsonldAction} document - JSON-LD Request
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
      const result = await rpc({
        body: {
          jsonrpc: '2.0',
          id: uuidv1(),
          method: this.method,
          params: signedDocument,
        },
        jwt: assistant.token,
        verification: verificationMethod
      });
      // hack специальный вызов для тестирования E2E. Без явного ответа sendMessage возникает ошибка SubError
      if (IS_AVA) {
        return this.bot.sendMessage(this.message.chat.id, result.purpose.abstract);
      }
    });
  }
}

module.exports = TelegramBotRequest;
