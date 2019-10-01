const validator = require('validator');
const Eyo = require('eyo-kernel');
const Abstract = require('./');
const logger = require('../../services/logger.service');
const dialogflowService = require('../../services/dialogflow.service');
const { spellText } = require('../../services/speller.service');
const { detectLang, isRUS, isENG } = require('../../services/detect-language.service');
const languageService = require('../../services/language.service');
const crypt = require('../../services/crypt.service');
const foodService = require('../../services/food.service');

class AbstractText extends Abstract {
  #text = [];
  /**
   * @example ['ru', rus', 'russian']
   * @type {Array}
   */
  #language = [];
  #entities;
  #parameters = []; // найденные параметры интента
  #category = []; // Получение существа события - сущность события
  #sentiment = []; // @example ['normal', 'angry']
  #hrefs = []; // internet links
  #names = []; // todo: полученные имена людей
  #emails = []; // полученные данные о почте
  #phones = []; // полученные телефоны
  // #addresses = []; // полученные адреса из текста
  // #behavior; // todo: анализируемое поведение. Анализируем введенный текст узнаем желания/намерение пользователя в более глубоком виде
  
  constructor(buffer) {
    super(buffer);
  }
  
  get sentiment() {
    return this.#sentiment;
  }
  get hrefs() {
    return this.#hrefs;
  }
  get entities() {
    return this.#entities; // todo: разбить на схемы
  }
  get emails() {
    return this.#emails;
  }
  get phones() {
    return this.#phones;
  }
  get category() {
    return this.#category;
  }
  get names() {
    return this.#names;
  }
  get parameters() {
    return this.#parameters;
  }
  
  set language(langCode) {
    if (!this.#language.includes(langCode)) {
      this.#language.unshift(langCode);
    }
  }
  /**
   * @returns {string}
   */
  get language() {
    return this.#language[0];
  }
  set text(text) {
    if (!this.#text.includes(text)) {
      this.#text.unshift(text);
    }
  }
  /**
   * @returns {string}
   */
  get text() {
    return this.#text[0];
  }
  
  /**
   * @description Здесь происходит наполнение Абстрактов из полученного текста.
   * Это насыщение абстракных моделей полученных внутри бота.
   * Абстракт имеет в себе факты, включая ссылки на них и краткую мета
   * @todo https://github.com/gotois/ProstoDiary_bot/issues/84
   * @returns {Promise<undefined>}
   */
  async fill() {
    this.text = this.buffer.toString();
    this.language = detectLang(this.text).language;
    
    // TODO: сделать перевод в английский текст
    // ...
    
    // ёфикация текста
    if (isRUS(this.language)) {
      const safeEyo = new Eyo();
      safeEyo.dictionary.loadSafeSync();
      this.text = safeEyo.restore(this.text);
    } else if (isENG(this.language)) {
    } else {
      // пока только поддерживаем EN, RU
      throw new Error('Unsupported language');
    }
    try {
      const yandexSpellLanguageCode = this.language.slice(0, 2);
      this.text = await spellText(this.text, yandexSpellLanguageCode);
    } catch (error) {
      logger.error(error);
    }
    try {
      const { categories, documentSentiment, entities, language, sentences, tokens } = await languageService.annotateText(this.text, this.language);
      this.language = language;
      this.#sentiment = documentSentiment;
      this.#category.push(categories);
      this.#entities = entities;
      if (sentences.length && sentences[0].text) {
        this.text = sentences[0].text.content;
      }
      
      for (let { lemma } of tokens) {
        if (validator.isEmail(lemma)) {
          this.#emails.push(lemma);
        } else if (validator.isMobilePhone(lemma)) {
          this.#phones.push(lemma);
        } else if (validator.isURL(lemma)) {
          this.#hrefs.push(lemma);
        }
        // TODO: получить имена
        // ...
        // TODO: получить адреса
        // ...
        // TODO: получить даты
        // ...
      }
    } catch (error) {
      logger.error(error.message);
    }
    // предложение нужно будет перепрочитать по умному:
    // когда? - сегодня - получаем абстрактное время от пользователя, которое нужно перевести в более точное.
    // что сделал? - купил сыра -> говорим что произошло действие "покупка", ищутся все предыдущие связи для актуализации этой покупке (место, время, валюта, ищется стоимость, кому была отправлена транзакция, из каких ресурсов)
    // купил что? сыр - 100 грамм -> из БД продуктов ищется сыр 100 грамм и прикрепляется ссылка
    
    // todo: вырезать конфиденциальную информацию и не отправлять ее на серверы анализов
    // ...
    
    if (this.text.length <= 256) {
      try {
        const dialogflowResult = await dialogflowService.detectTextIntent(this.text);
        this.language = dialogflowResult.languageCode;
        this.intent = dialogflowResult.intent.displayName;
        // todo: как-то использовать результат из dialogFlow
        this.#parameters.unshift(dialogflowResult.parameters.fields);

        // TODO: Если в интентах все необходимые параметры используются они
        // ...
        // TODO: Постисправление найденных параметров (Например, "к" = "тысяча", преобразование кастомных типов "37C" = "37 Number Celsius")
        // ...
        // TODO: на основе Intent'a делаем различные предположения и записываем в БД в структурированном виде
        // ...
      } catch (error) {
        logger.error(error.message);
      }
    }
    
    // FIXME: Разбить текст на строки через "\n" (Обработка каждой строки выполняется отдельно)
    // И еще лучше если это дополнительно прогнать через NLP
    
    // todo: это выполнять не здесь
    // Насыщение абстрактов (от Abstract к Natural)
    // ...
    // Связка абстракта фактами
    // ...
    
    // Сериализация найденных параметров (Entities)
    // ...
    
    // Исправление кастомных типов
    // (Например, "к" = "тысяча", преобразование кастомных типов "37C" = "37 Number Celsius")
    // 	.9 -> 0.9
    // ...
    
    // todo: middleware
    // дополняем данными из FatSecret
    // try {
    //   for (const parameter of this.#parameters) {
    //     if (parameter.Food) {
    //       for (const food of parameter.Food.listValue.values) {
    //         const results = await foodService.search(food.stringValue, 2);
    //         this.foodResults = results;
    //       }
    //     }
    //   }
    // } catch (error) {
    //   logger.error(error.message);
    // }
    
    // todo проверяем что текст поправил туду в todoist - если так то спрашиваем у пользователя прав ли бот
    // ...
  }
}

module.exports = AbstractText;
