const validator = require('validator');
const logger = require('../../../lib/log');
const languageService = require('../../../services/nlp.service'); // в моделях не должно быть сервисов
const Abstract = require('.');
const DynamicAction = require('../actions/dynamic-action');
const WebContent = require('../things/web-content');

class AbstractText extends Abstract {
  #creator;
  #publisher;
  constructor(data) {
    super(data);
    this.text = data.text;
    this.#creator = data.creator;
    this.#publisher = data.publisher;
  }
  get context() {
    return {
      ...super.context,
      '@context': {
        schema: 'http://schema.org/',
        agent: 'schema:agent',
        startTime: 'schema:startTime',
        object: 'schema:object',
        subjectOf: 'schema:subjectOf',
        name: 'schema:name',
        abstract: 'schema:abstract',
        encodingFormat: 'schema:encodingFormat',
        identifier: 'schema:identifier',
        provider: 'schema:provider',
        participant: 'schema:participant',
        value: 'schema:value',
        email: 'schema:email',
        mainEntity: 'schema:mainEntity',
      },
      '@type': 'Action',
      'object': {
        '@type': 'CreativeWork',
        'name': 'text',
        'abstract': this.abstract,
        'encodingFormat': 'text/plain',
        'mainEntity': this.objectMainEntity,
      },
      'subjectOf': this.subjectOf,
      // location,
    };
  }

  async prepare() {
    // eslint-disable-next-line
    const location = {
      '@type': 'Place',
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': '40.75',
        'longitude': '73.98',
      },
      'name': 'Empire State Building',
    };

    // todo это хэштеги. поддержать функциональность
    // const categories = new Set();
    // this.tags.forEach(tag => {
    //   categories.add(tag);
    // });

    // const { entities, language } = await languageService.analyzeEntities(this.text);
    // todo получение информации по локации
    // for (let entity of entities) {
    //   if (entity.type === 'LOCATION') {
    //     this.abstracts.push(new AbstractGeo({
    //       near: entity.name,
    //     }));
    //   }
    // }

    for (const sentense of languageService.splitTextBySentences(this.text)) {
      for (const subject of await this.detectBySentense(sentense)) {
        this.subjectOf.push(subject);
      }
    }
    this.abstract = this.text.toString('base64');

    // todo шифрование абстракта через openPGP (пока шифрование ботом излишне)
    // const crypt = require('../../services/crypt.service');
    // const encrypted = await crypt.openpgpEncrypt(Buffer.from(this.text), [
    //   passport.secret_key,
    // ]);
    // this.abstract = encrypted.data.toString('base64')
  }
  /**
   * @param {string} text - sentence text
   */
  async detectBySentense(text) {
    logger.info('detectBySentense');
    const action = await DynamicAction({ text });

    // todo поддержать массивы экшенов в зависимости от понятых глаголов
    const actions = [action];

    const { tokens } = await languageService.analyzeSyntax(
      text,
    );
    for (const token of tokens) {
      const { lemma } = token;

      if (validator.isEmail(lemma)) {
        // todo насыщать AbstractEmail
      } else if (validator.isMobilePhone(lemma)) {
        // todo насыщать AbstractPhone
      } else if (validator.isURL(lemma)) {
        const webcontentThing = await WebContent({
          url: lemma,
          namespace: this.namespace, // hack - передача namespace от родителя к потомку
          creator: this.#creator.clientId, // hack - передача creator от родителя к потомку
          publisher: this.#publisher, // hack - передача publisher от родителя к потомку
        });
        action.subjectOf.push(webcontentThing);
      }
      // TODO: names получить имена людей
      //  ...
      // TODO: получить адреса из текста
      //  ...
      // TODO: получить даты
      //  ...
      // TODO: behavior; анализируемое поведение. Анализируем введенный текст узнаем желания/намерение пользователя в более глубоком виде
      //  ...

      switch (token.partOfSpeech.tag) {
        case 'NOUN': {
          // существительное обычно отвечает на формирование name
          // todo если нет существительного что будет являться name? в сценарии когда присутствует ссылка например вида: `посмотрел HREF`
          if (!action.name) {
            action.name = lemma;
          }
          break;
        }
        case 'VERB': {
          // todo глагол обычно отвечает на формирование Action
          // "поел и поработал" - формиует два: EatAction, WorkAction
          break;
        }
        default: {
          break;
        }
      }
    }

    return actions;
  }
}

module.exports = AbstractText;
