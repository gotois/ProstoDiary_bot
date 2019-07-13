const Eyo = require('eyo-kernel');
const validator = require('validator');
const { inputAnalyze } = require('./intent.service');
const languageService = require('./language.service');
const { detectLang, isRUS, isENG } = require('./detect-language.service');
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
  #text = [];
  #entities; // todo: разбить на схемы
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
  
  constructor(text = '') {
    this.#text.push(text);
    this.#language.push(detectLang(text).language);
  }
  
  get language() {
    return this.#language[0];
  }
  
  get text() {
    return this.#text[0];
  }
  
  // Здесь происходит наполнение Абстрактов из полученного текста
  // Это насыщение абстракных моделей полученных внутри бота
  // Абстракт имеет в себе факты, включая ссылки на них и краткую мета
  // https://github.com/gotois/ProstoDiary_bot/issues/84
  async fill() {
    // TODO: сделать перевод в английский текст
    // ...
    
    // ёфикация текста
    if (isRUS(this.language)) {
      const safeEyo = new Eyo();
      safeEyo.dictionary.loadSafeSync();
      this.#text.unshift(safeEyo.restore(this.text));
    } else if (isENG(this.language)) {
    
    } else {
      // Если язык неопределяемый, пока только поддерживаем EN, RU, генерируем ошибку
      throw new Error('Unsupported language')
    }
    try {
      const yandexSpellLanguageCode = this.language.slice(0, 2);
      const spelledText = await spellText(this.text, yandexSpellLanguageCode);
      this.#text.unshift(spelledText);
    } catch (error) {
      logger.error(error);
    }
    try {
      const { categories, documentSentiment, entities, language, sentences, tokens } = await languageService.annotateText(this.text, this.language);
      this.#sentiment = documentSentiment;
      this.#language.unshift(language);
      this.#category.push(categories);
      this.#entities = entities;
      if (sentences.length && sentences[0].text) {
        this.#text.unshift(sentences[0].text.content);
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
    
    try {
      const dialogflowResult = await inputAnalyze(this.text);
      // TODO: проверка интента - если он задекларирован ботом - то дальше, иначе генерация ошибки
      this.#intent.push(dialogflowResult.intent.displayName);
      // TODO: а также использовать результат из dialogFlow
      // ...
      // TODO: Если в интентах все необходимые параметры используются они
      // ...
      // TODO: Постисправление найденных параметров (Например, "к" = "тысяча", преобразование кастомных типов "37C" = "37 Number Celsius")
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
    // (Например, "к" = "тысяча", преобразование кастомных типов "37C" = "37 Number Celsius")
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
        text: this.#text,
        hrefs: this.#hrefs,
        entities: this.#entities,
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
