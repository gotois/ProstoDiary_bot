const Eyo = require('eyo-kernel');
const validator = require('validator');
const { inputAnalyze } = require('./intent.service');
const languageService = require('./language.service');
const { detectLang } = require('./detect-language.service');
const { spellText } = require('./speller.service');
const logger = require('./logger.service');

const xxx = (intentName) => {
  switch (intentName) {
    case INTENTS.BUY: {
      // if (result.parameters) {
      // price: result.parameters.fields.price
      // currency: result.parameters.fields.currency
      // }
      return result.fulfillmentText;
    }
    case INTENTS.EAT: {
      let outMessage = result.fulfillmentText;
      for (const eatValue of result.parameters.fields.Food.listValue
        .values) {
        // TODO: брать значения из database.foods;
        // заменить stringify
        // console.log(eatValue.stringValue)
        outMessage += '\n' + eatValue.stringValue;
      }
      return outMessage;
    }
    case INTENTS.FINANCE: {
      return result.fulfillmentText;
    }
    case INTENTS.FITNESS: {
      return result.fulfillmentText;
    }
    case INTENTS.WEIGHT: {
      return result.fulfillmentText;
    }
    case INTENTS.WORK: {
      return result.fulfillmentText;
    }
    default: {
      // No intent matched
      return '';
    }
  }
}

// const { Abstract } = require('./abstract.service');
/**
 * ВАЖНО! Это не StoryLanguage!
 * Создание единой (общей) истории деятельности абстрактов
 * ответом служит полученные Факты из текста
 * @description Story управляется абстрактами. Которые насыщаются в abstract.service
 */
class Story {
  #text;
  #spelledText;
  #language = []; // @example ['ru', rus', 'russian']
  #sentiment = []; // @example ['normal', 'angry']
  #hrefs = []; // internet links
  #names = []; // полученные имена людей
  #addresses = []; // полученные адреса из текста
  #emails = []; // полученные данные о почте
  #phones = []; // полученные телефоны
  #behavior; // анализируемое поведение. Анализируем введенный текст узнаем желания/намерение пользователя в более глубоком виде
  #intent = []; // Определяем намерения
  #geo; // место где произошло событие
  #date; // Получение даты события (Подведение таймлайна) <SmartDate>?
  #category = []; // Получение существа события - сущность события
  
  get language() {
    return this.#language;
  }
  
  constructor(text = '') {
    this.#text = text;
    this.#language.push(detectLang(text).language);
  }
  
  // Здесь происходит наполнение Абстрактов из полученного текста
  // Это насыщение абстракных моделей полученных внутри бота
  // Абстракт имеет в себе факты, включая ссылки на них и краткую мета
  // https://github.com/gotois/ProstoDiary_bot/issues/84
  async fill() {
    // ёфикация текста
    // TODO: это нужно только если русский текст
    const safeEyo = new Eyo();
    safeEyo.dictionary.loadSafeSync();
    this.#spelledText = safeEyo.restore(this.#text);
    
    try {
      // TODO: добавить аргумент текущего языка для ускорения
      this.#spelledText = await spellText(this.#spelledText/*, this.#language[0]*/);
    } catch (error) {
      logger.error(error);
    }
    
    // TODO: вырезаем из текста имейл, адреса, имена, телефоны и добавляем их в специальные группы.
    // let smallText = '';
    
    try {
      const { categories, documentSentiment, entities, language, sentences, tokens } = await languageService.annotateText(this.#spelledText, this.language[0]);
      this.#sentiment = documentSentiment;
      this.#language.unshift(language);
      this.#category.push(categories);
  
      // logger.info(entities);
      // logger.info(sentences);
      
      for (let { lemma } of tokens) {
        if (validator.isEmail(lemma)) {
          this.#emails.push(lemma);
        } else if (validator.isMobilePhone(lemma)) {
          this.#phones.push(lemma);
        } else if (validator.isURL(lemma)) {
          this.#hrefs.push(lemma);
        }
      }
    } catch (error) {
      logger.error(error.message);
    }
    
    try {
      const dialogflowResult = await inputAnalyze(this.#spelledText);
      this.#intent.push(dialogflowResult.intent.displayName);
      // TODO: а также использовать результат из dialogFlow
      // ...
      // TODO: на основе Intent'a делаем различные предположения и записываем в БД в структурированном виде
      // ...
    } catch (error) {
      logger.error(error.message);
    }
    
    // FIXME: Разбить текст на строки через "\n" (Обработка каждой строки выполняется отдельно)
    // А еще лучше если это будет сделано через NLP
  }
  /**
   *
   * @description Operation Definition (Типизация абстрактов в строгий структурный вид)
   */
  async definition () {
    // Насыщение абстрактов (от Abstract к Natural)
    // ...
    // Связка абстракта фактами
    // ...
    // Сериализация найденных параметров (Entities)
    // ...
    // Исправление кастомных типов
    // ...
    // Merge - формируем Конечный состав параметров
    // включающий undefined если нигде не получилось ничего найти
    // ...
    
    // const link = await Story.find(this.abstractDefinitions);
  
    return {
      // link, // историческая ссылка
      // projects: [], // Разбиение на проекты (нужно для лучшего поиска) // https://github.com/gotois/ProstoDiary_bot/issues/79
      metadata: {
        language: this.#language,
        sentiment: this.#sentiment,
        spelledText: this.#spelledText,
        hrefs: this.#hrefs,
        // #names,
        // #addresses
        emails: this.#emails,
        phones: this.#phones,
        // #behavior
        intent: this.#intent,
        // #geo
        // #date
        category: this.#category,
      },
    };
  }
  
  // Поиск исторической ссылки  (Хэш?)
  static async find (abstractDefinitions) {
    return '';
  }
  
  /**
   * Обновление/Дополнение в БД
   * @returns {Promise<void>}
   */
  async update () {
  }
  
  /**
   * сохранение в БД
   * @returns {Promise<void>}
   */
  async save () {
  }
}

module.exports = Story;
