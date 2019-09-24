const { version } = require('../../../package');
const INTENTS = require('../../core/intents');
const AbstractText = require('../../models/abstract/abstract-text');
const AbstractPhoto = require('../../models/abstract/abstract-photo');
const AbstractDocument = require('../../models/abstract/abstract-document');
const { PERSON } = require('../../environment');
/**
 * @constant
 * @type {{CORE: string, HARD: string, SOFT: string}}
 */
const STORY_TYPES = {
  SOFT: 'SOFT',
  HARD: 'HARD',
  CORE: 'CORE',
};
/**
 * ВАЖНО! Это не StoryLanguage!
 * Создание единой (общей) истории деятельности абстрактов
 * ответом служит полученные Факты из текста
 * @description Story управляется абстрактами. Которые насыщаются в abstract.service
 */
class Story {
  #abstract = null;
  #intent = null;
  #type = null;
  #publisher = undefined;
  #date = []; // Получение даты события (Подведение таймлайна) <SmartDate>?
  /**
   * @param {Abstract} abstract - original
   * @param {object} parameters - params
   * @param {string} parameters.publisher - кто ответственнен за функционал полученной истории
   * @param {string} parameters.intent - намерения
   * @param {number} parameters.date - smart date from to until
   * @param {number} parameters.telegram_user_id - params
   * @param {number} parameters.telegram_message_id - params
   */
  // @todo https://github.com/gotois/ProstoDiary_bot/issues/152#issuecomment-527747303
  constructor(abstract, {
    publisher,
    intent = INTENTS.UNDEFINED,
    type = STORY_TYPES.SOFT,
    date = Date.now(),
    telegram_user_id,
    telegram_message_id
  }) {
    this.#abstract = abstract;
    this.type = type;
    this.telegram_user_id = telegram_user_id;
    this.telegram_message_id = telegram_message_id;
    this.#date.push(date);
    this.#publisher = publisher;
    if (intent) {
      this.#intent = intent;
    }
  }

  // todo: [TIMESTAMP_START, TIMESTAMP_END]
  get date() {
    // fixme: по умолчанию заполняем время с шагом в один час
    return [this.#date].flat().sort();
  }
  get intent() {
    return this.#abstract.intent || this.#intent;
  }
  /**
   * @param {STORY_TYPES} storyType - STORY_TYPES
   */
  set type(storyType) {
    if (!Object.values(STORY_TYPES).includes(storyType)) {
      throw new TypeError('Unknown story type');
    }
    // todo: если приходит более очевидный тип Hard или Core, то это заменяет прежний тип
    this.#type = storyType;
  }
  get type() {
    return this.#type;
  }
  /**
   * @todo: добавить криптование контента crypt.encode(context)
   * параметры проставляются в зависимости от типа Abstract
   * @returns {object}
   */
  get context() {
    if (this.#abstract instanceof AbstractText) {
      return {
        abstract: 'text',
        languageCode: this.#abstract.language,
        text: this.#abstract.text,
        sentiment: this.#abstract.sentiment,
        hrefs: this.#abstract.hrefs,
        entities: this.#abstract.entities,
        emails: this.#abstract.emails,
        phones: this.#abstract.phones,
        category: this.#abstract.category,
        names: this.#abstract.names,
        parameters: this.#abstract.parameters,
        // geo: this.#abstract.geo // todo: geoJSON доступен из текста
        // wiki: todo: {topologyLink} ?краткое описание из вики?
      }
    } else if (this.#abstract instanceof AbstractPhoto) {
      return {
        abstract: 'photo',
      }
    } else if (this.#abstract instanceof AbstractDocument) {
      return {
        abstract: 'document',
      }
    }
    throw new Error('Unknown abstract');
  }
  /**
   * @todo https://github.com/gotois/ProstoDiary_bot/issues/152
   * @description Operation Definition (Типизация абстрактов в строгий структурный вид)
   * Merge - формируем Конечный состав параметров, включающий undefined если нигде не получилось ничего найти
   * @returns {object}
   */
  toJSON () {
    return {
      telegram_user_id: this.telegram_user_id,
      telegram_message_id: this.telegram_message_id,
      // todo: сюда же добавляется subject из письма
      // todo: сюда же добавляется raw - ссылка на исходик (в письме аттача или типо того)
      // todo: канонический урл - url
      // todo: bot blockchain sign
      
      intent: this.intent,
      type: this.type, // https://github.com/gotois/ProstoDiary_bot/issues/152#issuecomment-527747303
      date: this.date, // SmartDate
      version: version, // API ver
      author: JSON.stringify(PERSON),
      publisher: this.publisher,
      context: this.context,
      jurisdiction: this.jurisdiction,
    };
  }
}

module.exports = Story;
