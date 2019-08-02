const Eyo = require('eyo-kernel');
const { version } = require('../../package');
const validator = require('validator');
const crypt = require('./crypt.service');
const dbEntries = require('../database/entities.database');
const { inputAnalyze } = require('./intent.service');
const languageService = require('./language.service');
const { detectLang, isRUS, isENG } = require('./detect-language.service');
const { spellText } = require('./speller.service');
const logger = require('./logger.service');
const foursquare = require('./foursquare.service');
const { PERSON } = require('../environment');

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
  #names = []; // todo: полученные имена людей
  #addresses = []; // полученные адреса из текста
  #emails = []; // полученные данные о почте
  #phones = []; // полученные телефоны
  #behavior; // todo: анализируемое поведение. Анализируем введенный текст узнаем желания/намерение пользователя в более глубоком виде
  #intent = []; // Определяем намерения
  #place; // // {geoJSON} - место где была сделана запись.
  #date = []; // Получение даты события (Подведение таймлайна) <SmartDate>? // по умолчанию заполняем время с шагом в один день
  #category = []; // Получение существа события - сущность события
  /**
   * @param {string} text - original text
   */
  constructor({ text, date, currentUser, intent, telegram_message_id }) {
    this.text = text.trim();
    this.telegram_user_id = currentUser.id;
    this.telegram_message_id = telegram_message_id;
    this.language = detectLang(this.text).language;
    if (intent) {
      this.#intent.push(intent);
    }
    if (date) {
      this.#date.push(date);
    }
  }
  get intent() {
    return this.#intent[0].replace('Intent', '').toLowerCase();
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
  // todo: crypt.encode(context)
  get context() {
    return {
      queryText: this.#text[this.#text.length - 1], // originalText
        // todo параметры проставляются в зависимости от интента
        parameters: {
        Health: {
          // Вес
          // Рост
        },
        Food: {
          'салат': {
            id: 0,
              protein: 0,
              fat: 0,
              carbohydrate: 0,
              kcal: 0,
            // title
          }
        }
      },
    
      // https://github.com/gotois/ProstoDiary_bot/issues/146
    
      languageCode: this.#language,
        sentiment: this.#sentiment,
        text: this.#text,
        hrefs: this.#hrefs,
        entities: this.#entities,
        // #names,
        // #addresses
        emails: this.#emails,
        phones: this.#phones,
        // #behavior
        // #date - smart date
        category: this.#category,
    
      // #place
    };
  }
  /**
   * @description Здесь происходит наполнение Абстрактов из полученного текста.
   * Это насыщение абстракных моделей полученных внутри бота.
   * Абстракт имеет в себе факты, включая ссылки на них и краткую мета
   * @todo https://github.com/gotois/ProstoDiary_bot/issues/84
   * @returns {Promise<undefined>}
   */
  async fill() {
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
      logger.info('Unsupported language');
      return;
    }
    try {
      const yandexSpellLanguageCode = this.language.slice(0, 2);
      this.text = await spellText(this.text, yandexSpellLanguageCode);
    } catch (error) {
      logger.error(error);
    }
    try {
      const { categories, documentSentiment, entities, language, sentences, tokens } = await languageService.annotateText(this.text, this.language);
      this.#sentiment = documentSentiment;
      this.language = language;
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
    }
    // todo: использовать foursquare API
    // this.#place = ...
    
    // FIXME: Разбить текст на строки через "\n" (Обработка каждой строки выполняется отдельно)
    // А еще лучше если это будет сделано через NLP
  
    // Насыщение абстрактов (от Abstract к Natural)
    // ...
    // Связка абстракта фактами
    // ...
    // Сериализация найденных параметров (Entities)
    // ...
    // Исправление кастомных типов
    // (Например, "к" = "тысяча", преобразование кастомных типов "37C" = "37 Number Celsius")
    // ...
    
    // todo проверяем что текст поправил туду в todoist - если так то спрашиваем у пользователя прав ли бот
    // ...
  }
  /**
   * @description Operation Definition (Типизация абстрактов в строгий структурный вид)
   * Merge - формируем Конечный состав параметров, включающий undefined если нигде не получилось ничего найти
   * @returns {JSON}
   */
  toJSON () {
    return {
      type: this.intent,
      version: version,
      author: JSON.stringify(PERSON),
      publisher: "goto Interactive Software",
      jurisdiction: JSON.stringify([
        {
          "coding": [
            {
              "system": "urn:iso:std:iso:3166",
              "code": "GB",
              // "display": "United Kingdom of Great Britain and Northern Ireland (the)"
            }
          ]
        }
      ]),
      telegram_user_id: this.telegram_user_id,
      telegram_message_id: this.telegram_message_id,
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
