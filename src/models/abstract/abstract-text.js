const validator = require('validator');
const SchemaOrg = require('schema.org');
const format = require('date-fns/format');
const fromUnixTime = require('date-fns/fromUnixTime');
const dialogService = require('../../services/dialog.service'); // в моделях не должно быть сервисов
const logger = require('../../lib/log'); // в моделях не должно быть сервисов
const languageService = require('../../services/nlp.service'); // в моделях не должно быть сервисов
const Abstract = require('.');
const AbstractWebpage = require('./abstract-webpage');
const Action = require('../../core/models/action');
/**
 * @todo на основе набора свойств пытаюсь насытить schema.org
 * затем получать родителя из схемы и насыщать ее по необходимости из истории
 * example:
 * myForm({
 *   "availability": "http://schema.org/InStock",
 *   'priceCurrency': 'USD',
 *   'price': 900,
 * })
 * @param {object} parameters
 * @returns {object} - тип JSON-LD
 */
const myForm = (parameters) => {
  const schemaOrg = new SchemaOrg();
  const type = schemaOrg.getType(parameters);
  return {
    '@type': type || 'Thing',
    ...parameters,
  };
};

/**
 * @todo перенести в modules
 * @param {string} text - sentence text
 */
async function detectBySentense(text) {
  logger.info('detectBySentense');

  if (text.length > 256) {
    throw new Error('So big for detect');
  }
  const subjects = [];

  /**
   * @param {Action} action - JSON-LD action
   * @returns {object}
   */
  function generateDocument(action) {
    const object = myForm({
      ...parameters, // параметры полученные от Diglogflow
      name: encodeURIComponent(objectNames[0]), // в идеале должно браться из dialogflow, но если не получается, то берем существительное и прилагательное через NLP
      // inLanguage: 'xxx' // язык
    });

    const innerDocument = {
      // предполагаю что контекст будет создавать Space для каждого отдельного события это будет вида: 'https://gotointeractive.com/:object/:subject
      '@context': {
        schema: 'http://schema.org/',
        object: 'schema:object',
        // для валидации schema
        ...Object.keys(parameters).reduce((accumulator, k) => {
          accumulator[k] = 'schema:' + k;
          return accumulator;
        }, {}),
      },
      '@type': action.type,
      object,
      // actionStatus: action.status,
    };
    return innerDocument;
  }

  // todo возможно исключение, надо его правильно обработать
  // todo поменять uid
  const dialogflowResult = await dialogService.detect(text, 'test-uid');
  const parameters = dialogService.formatParameters(dialogflowResult);

  const { tokens } = await languageService.analyzeSyntax(
    dialogflowResult.queryText,
  );
  const objectNames = [];
  for (const token of tokens) {
    const { lemma } = token;

    if (validator.isEmail(lemma)) {
      // this.abstracts.push(new AbstractEmail(lemma));
    } else if (validator.isMobilePhone(lemma)) {
      // this.abstracts.push(new AbstractPhone(lemma));
    } else if (validator.isURL(lemma)) {
      const webpage = new AbstractWebpage({ url: lemma });
      await webpage.prepare();
      subjects.push(webpage.context);
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
      // соединитель - союз, нужно увеличить возвращаемый массив на один
      // case 'CONJ': {
      //   resCount++;
      //   break;
      // }
      case 'NOUN': {
        objectNames.push(lemma);
        break;
      }
      case 'VERB': {
        // categories.add(lemma); // fixme здесь использовать существительное tag === 'NOUN'
        break;
      }
      default: {
        break;
      }
    }
  }

  subjects.push(generateDocument(new Action(dialogflowResult.intent.displayName)));

  return subjects;
}

class AbstractText extends Abstract {
  constructor(data) {
    super(data);
    this.text = data.text;
    this.creator = data.creator;
    this.publisher = data.publisher;
    this.subjectOf = [];
  }

  get context() {
    return {
      ...super.context,
      '@context': {
        schema: 'http://schema.org/',
        agent: 'schema:agent',
        startTime: 'schema:startTime',
        subjectOf: 'schema:subjectOf',
        object: 'schema:object',
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
      "@id": this.namespace, // изоляцинные идентификаторы сообщения
      '@type': 'Action',
      'agent': {
        '@type': 'Organization',
        'identifier': this.creator, // identifier assistant
      },
      'participant': {
        '@type': 'Person',
        'email': this.publisher, // identifier user
      },
      'startTime': format(
        fromUnixTime(Math.round(new Date().getTime() / 1000)),
        'yyyy-MM-dd',
      ),
      'subjectOf': this.subjectOf,
      'object': {
        '@type': 'CreativeWork',
        'name': 'text',
        'abstract': this.abstract,
        'encodingFormat': 'text/plain',
        'mainEntity': this.objectMainEntity,
      },
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
      for (const subject of await detectBySentense(sentense)) {
        this.subjectOf.push(subject);
      }
    }
    this.abstract = encodeURIComponent(this.text).toString('base64');

    // todo шифрование абстракта через openPGP (пока шифрование ботом излишне)
    // const crypt = require('../../services/crypt.service');
    // const encrypted = await crypt.openpgpEncrypt(Buffer.from(this.text), [
    //   passport.secret_key,
    // ]);
    // this.abstract = encrypted.data.toString('base64')
  }
}

module.exports = AbstractText;
