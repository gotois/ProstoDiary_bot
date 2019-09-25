const { version } = require('../../../package');
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
  #type = null;
  #date = []; // Получение даты события (Подведение таймлайна) <SmartDate>?
  /**
   * @param {Abstract} abstract - original
   * @param {object} parameters - params
   * @param {number} parameters.date - smart date from to until
   * @param {number} parameters.telegram_user_id - params
   * @param {number} parameters.telegram_message_id - params
   */
  // @todo https://github.com/gotois/ProstoDiary_bot/issues/152#issuecomment-527747303
  constructor(abstract, {
    type = STORY_TYPES.SOFT,
    date = Date.now(),
    telegram_user_id,
    telegram_message_id
  }) {
    this.#abstract = abstract;
    this.#date.push(date);
    this.type = type;
    this.telegram_user_id = telegram_user_id;
    this.telegram_message_id = telegram_message_id;
  }

  // todo: [TIMESTAMP_START, TIMESTAMP_END]
  get date() {
    // fixme: по умолчанию заполняем время с шагом в один час
    return [this.#date].flat().sort();
  }
  /**
   * @param {STORY_TYPES} storyType - STORY_TYPES
   */
  set type(storyType) {
    if (!Object.values(STORY_TYPES).includes(storyType)) {
      throw new TypeError('Unknown story type');
    }
    this.#type = storyType;
  }
  /**
   * @todo: если есть более очевидный тип Hard или Core, то он заменяет прежний тип
   * @returns {STORY_TYPES}
   */
  get type() {
    return this.#type;
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
      
      // intent: this.intent,
      type: this.type, // https://github.com/gotois/ProstoDiary_bot/issues/152#issuecomment-527747303
      date: this.date, // SmartDate
      version: version, // API ver
      author: JSON.stringify(PERSON), // todo: change person type
      context: this.context,
      jurisdiction: this.jurisdiction,
    };
  }
}

module.exports = Story;
