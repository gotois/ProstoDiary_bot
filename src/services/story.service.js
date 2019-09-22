const { version } = require('../../package');
const AbstractText = require('../models/abstract-text');
const AbstractPhoto = require('../models/abstract-photo');
const AbstractDocument = require('../models/abstract-document');
const dbEntries = require('../database/entities.database');

const logger = require('./logger.service');
const { PERSON } = require('../environment');

// todo: это в мидлваре
const foodService = require('./food.service');

// const { Abstract } = require('./abstract.service');

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
  #type = [];
  #date = []; // Получение даты события (Подведение таймлайна) <SmartDate>? // по умолчанию заполняем время с шагом в один день
  
  /**
   * @param {Abstract} abstract - original
   * @param {object} parameters - params
   * @param {number} parameters.date - params
   * @param {number} parameters.telegram_user_id - params
   * @param {number} parameters.telegram_message_id - params
   */
  // @todo https://github.com/gotois/ProstoDiary_bot/issues/152#issuecomment-527747303
  constructor(abstract, {
    // intent,
    type = STORY_TYPES.SOFT,
    date = Date.now(),
    telegram_user_id,
    telegram_message_id
  }) {
    this.#abstract = abstract;
    this.#type.unshift(type);
    this.telegram_user_id = telegram_user_id;
    this.telegram_message_id = telegram_message_id;
    this.#date.push(date);
    // if (intent) {
    //   this.#intent.push(intent);
    // }
  }

  set type(storyType) {
    if (!Object.values(STORY_TYPES).includes(storyType)) {
      throw new TypeError('Unknown story type');
    }
    this.#type.unshift(storyType)
  }
  /**
   * @todo: добавить криптование контента crypt.encode(context)
   * @returns {object}
   */
  get context() {
    // параметры проставляются в зависимости от типа Abstract.
    if (this.#abstract instanceof AbstractText) {
      return {
        abstract: 'text',
        // languageCode: this.#language,
        // sentiment: this.#sentiment,
        // text: this.#text,
        // hrefs: this.#hrefs,
        // entities: this.#entities,
        // emails: this.#emails,
        // phones: this.#phones,
        // category: this.#category,
        // #names,
        // #addresses
        // #behavior
        // foodResults: this.foodResults, // todo: тестово, нужно иное насыщение
        // parameters: this.#parameters[0],
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
   * @returns {JSON}
   */
  toJSON () {
    return {
      telegram_user_id: this.telegram_user_id,
      telegram_message_id: this.telegram_message_id,
      
      type: this.intent,
      version: version,
      author: JSON.stringify(PERSON),
      publisher: "goto Interactive Software",//todo: брать из письма
      // jurisdiction: JSON.stringify([
      //   {
      //     "coding": [
      //       {
      //         "system": "urn:iso:std:iso:3166",
      //         "code": "GB",
      //         // "display": "United Kingdom of Great Britain and Northern Ireland (the)"
      //       }
      //     ]
      //   }
      // ]),
      
      // date: - smart date
      
      context: this.context,
    };
  }
  /**
   * @returns {undefined}
   */
  async update () {
    await dbEntries.put(this.toJSON());
  }
  /**
   * @todo https://github.com/gotois/ProstoDiary_bot/issues/98
   * @returns {undefined}
   */
  async save () {
    await dbEntries.post(this.toJSON());
  }
}

module.exports = Story;
