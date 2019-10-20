const validator = require('validator');
const Abstract = require('./abstract');
const { pool } = require('../../core/database');
const logger = require('../../services/logger.service');
const languageService = require('../../services/language.service');
const dialogflowService = require('../../services/dialogflow.service');
const foodService = require('../../services/food.service');
const dbEntries = require('../../database/entities.database');

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
   * @returns {object}
   */
  get context() {
    return {
      ...super.context,
      languageCode: this.language,
      text: this.text,
      sentiment: this.sentiment,
      hrefs: this.hrefs,
      entities: this.entities,
      emails: this.emails,
      phones: this.phones,
      category: this.category,
      names: this.names,
      parameters: this.parameters,
      // geo: this.geo // todo: geoJSON доступен из текста
      // wiki: todo: {topologyLink} ?краткое описание из вики?
    };
  }
  
  /**
   * @description Здесь происходит наполнение Абстрактов из полученного текста.
   * Это насыщение абстракных моделей полученных внутри бота.
   * Абстракт имеет в себе факты, включая ссылки на них и краткую мета
   * @todo https://github.com/gotois/ProstoDiary_bot/issues/84
   * @returns {Promise<undefined>}
   */
  async precommit() {
    await super.precommit();
    if (this.rawDecrypt) {
      this.text = this.rawDecrypt;
    }

    // TODO: сделать перевод в английский текст
    //  ...
    
    if (this.text.length <= 256) {
      try {
        // todo: заменять перед запросами конфиденциальную информацию фейками, не теряя контекста
        //  ...
        const dialogflowResult = await dialogflowService.detectTextIntent(
          this.text,
        );
        console.log('dialogflowResult', dialogflowResult.intent.displayName)
        this.language = dialogflowResult.languageCode;
        this.tag = dialogflowResult.intent.displayName;
        // dialogflowResult.parameters.fields
      } catch (error) {
        logger.error(error.message);
      }
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
        //  ...
        // TODO: получить адреса
        //  ...
        // TODO: получить даты
        //  ...
      }
    } catch (error) {
      logger.error(error.message);
    }
    // предложение нужно будет перепрочитать по умному:
    // когда? - сегодня - получаем абстрактное время от пользователя, которое нужно перевести в более точное.
    // что сделал? - купил сыра -> говорим что произошло действие "покупка", ищутся все предыдущие связи для актуализации этой покупке (место, время, валюта, ищется стоимость, кому была отправлена транзакция, из каких ресурсов)
    // купил что? сыр - 100 грамм -> из БД продуктов ищется сыр 100 грамм и прикрепляется ссылка
    
    // FIXME: Разбить текст на строки через "\n" (Обработка каждой строки выполняется отдельно)
    // И еще лучше если это дополнительно прогнать через NLP
    
    // todo: это выполнять не здесь
    //  Насыщение абстрактов (от Abstract к Natural)
    //  ...
    //  Связка абстракта фактами
    //  ...
    
    // todo Сериализация найденных параметров (Entities)
    //  ...
    
    // todo: middleware
    //  дополняем данными из FatSecret
    //  try {
    //   for (const parameter of this.#parameters) {
    //     if (parameter.Food) {
    //       for (const food of parameter.Food.listValue.values) {
    //         const results = await foodService.search(food.stringValue, 2);
    //         this.foodResults = results;
    //       }
    //     }
    //   }
    //  } catch (error) {
    //   logger.error(error.message);
    //  }
    
    // todo проверяем что текст поправил туду в todoist - если так то спрашиваем у пользователя прав ли бот
    //  ...
  }

  async commit() {
    await super.commit();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      // формируем запрос message
      const messageResult = await client.query({
        name: 'create-message',
        text: `INSERT INTO message (url, telegram_message_id)
             VALUES ($1, $2)
             RETURNING id`,
        values: [this.mail_uid, this.telegram_message_id],
      });
      console.log('zzz', messageResult)
      messageResult.rows[0].id;
      // https://stackoverflow.com/questions/6722344/select-or-insert-a-row-in-one-command
      // 2 - формируем запрос creator_id
      const creatorSelectResult = await client.query({
        name: 'creator-select',
        text: `SELECT id FROM creator WHERE email = $1`,
        values: [this.creator.email],
      });
      console.log(creatorSelectResult)
      return
      if (creatorSelectResult.rows.length == 0) {
        const creatorResult = await client.query({
          name: 'create-creator',
          text: `INSERT INTO creator (jsonld)
             VALUES ($1)
             RETURNING *`,
          values: ['xxx'],
        });
      }


      creatorResult.rows[0].id;
      // 3 - формируем запрос publisher_id
      // ...

      await client.query({
        name: 'create-commit',
        text: `INSERT INTO abstract (bot_story_id, user_story_id)
             VALUES ($1, $2)
             RETURNING *`,
        values: [telegram_message_id],
      });
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = AbstractText;
