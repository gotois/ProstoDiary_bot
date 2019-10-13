const openpgp = require('openpgp');
const { version, publisher } = require('../../../package');
const crypt = require('../../services/crypt.service');
const INTENTS = require('../../core/intents');
/**
 * https://github.com/gotois/ProstoDiary_bot/issues/152#issuecomment-527747303
 *
 * @constant
 * @type {{CORE: string, HARD: string, SOFT: string}}
 */
const INPUT_TYPE = {
  SOFT: 'SOFT', // Запись только кажется верной
  HARD: 'HARD', // Запись может быть правдивой
  CORE: 'CORE', // Исключительно точный ввод
};

class Abstract {
  // todo #id - UID
  // ...
  #mime;
  /**
   * @type {INPUT_TYPE}
   */
  #type = INPUT_TYPE.SOFT; // todo: rename inputType?
  /**
   * @type {Array<Tag>}
   */
  #tags = [];
  #creator; // возвращает ID Person|Bot
  /**
   * кто ответственнен за публикацию (пользователь, бот или сторонний сервис)
   * @type {string}
   */
  #publisher;
  /**
   * @type {Buffer}
   */
  #raw = null;
  /**
   * Получение даты события (Подведение таймлайна)
   * SmartDate - [TIMESTAMP_START, TIMESTAMP_END]
   *
   * @type {Array<number>}
   */
  #timestamp = [];
  // ...

  /**
   * @param {Buffer} raw - raw content
   * @param {string} mime - mime type
   * @param {number} timestamp - smart date from to until
   */
  constructor(raw, mime, timestamp = Date.now()) {
    this.#raw = raw;
    this.#mime = mime;
  
    // ...
    // TODO: Постисправление найденных параметров (Например, "к" = "тысяча", преобразование кастомных типов "37C" = "37 Number Celsius")
    // ...
    
    // fixme: по умолчанию заполняем время с шагом в один час
    //  ...
    this.#timestamp.push(timestamp);
  }
  /**
   * @todo: если есть более очевидный тип Hard или Core, то он заменяет прежний тип
   * @param {INPUT_TYPE} inputType - type
   */
  set type(inputType) {
    if (!Object.values(INPUT_TYPE).includes(inputType)) {
      throw new TypeError('Unknown story type');
    }
    this.#type = inputType;
  }
  /**
   * @returns {INPUT_TYPE}
   */
  get type() {
    return this.#type;
  }
  set timestamp(timestamp) {
    this.#timestamp.unshift(timestamp);
  }
  get timestamp() {
    return this.#timestamp;
  }
  get mime() {
    return this.#mime;
  }
  /**
   * @description bot package version
   * @type {string}
   */
  get version() {
    return version;
  }
  /**
   * @todo: это правовое поле действий бота
   * @type {JSON|undefined}
   */
  get jurisdiction() {
    return JSON.stringify([
      {
        "publisher": publisher,
        "coding": [
          {
            "system": "urn:iso:std:iso:3166",
            "code": "GB",
            // "display": "United Kingdom of Great Britain and Northern Ireland (the)"
          }
        ]
      }
    ]);
  }
  set creator(creator) {
    if (Array.isArray(creator)) {
      this.#creator = creator.flatMap(({ address }) => {
        return address;
      })
    } else {
      this.#creator = creator;
    }
  }
  get creator() {
    return this.#creator;
  }
  set publisher(publisher) {
    this.#publisher = publisher;
  }
  get publisher () {
    return this.#publisher;
  }
  get tags() {
    return this.#tags;
  }
  get raw() {
    // todo: если есть ссылка, то используем ее
    return this.#raw;
  }
  /**
   * @param {Tag} tagName - tag name
   */
  set tag(tagName) {
    tagName = tagName.replace('Intent', '').toLowerCase();
    this.#tags.unshift(tagName);
  }
  /**
   * @todo: добавить криптование контента crypt.encode(text)
   * @returns {object}
   */
  get context() {
    return {
      type: this.type,
      tags: this.tags,
      raw: this.raw,
      version: this.version,
      jurisdiction: this.jurisdiction,
      timestamp: this.timestamp,
      creator: this.creator,
      publisher: this.publisher,
  
      telegram_bot_id: this.telegram_bot_id,
      telegram_user_id: this.telegram_user_id,
      telegram_message_id: this.telegram_message_id,
      email_message_id: this.email_message_id,
    };
  }
  /**
   * @override
   * @returns {Promise<void>}
   */
  async precommit() {
    // todo такую проверку делать только для абстракта типа текст
    const rawString = this.raw.toString();
    if (rawString.startsWith('-----BEGIN PGP MESSAGE-----')) {
      const rawDecrypt = await openpgp.decrypt({
        message: await openpgp.message.readArmored(),
        passwords: ['secret stuff'],
      });
      this.rawDecrypt = rawDecrypt.data;
    } else {
      this.rawDecrypt = rawString;
    }
  }
  /**
   * @fixme доделать сохранение абстракта во временную таблицу
   * @override
   * @returns {Promise<UID>}
   */
  async commit() {
    await this.precommit();
  }
}

module.exports = Abstract;
