const validator = require('validator');
const SchemaOrg = require('schema.org');
const format = require('date-fns/format');
const fromUnixTime = require('date-fns/fromUnixTime');
const rpc = require('../lib/rpc');
const dialogService = require('../../services/dialog.service');
const languageService = require('../../services/nlp.service');
const logger = require('../../services/logger.service');
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
 * @param {string} intent - dialogflowResult intent displayName
 * @returns {string}
 */
function convertIntentToActionName(intent) {
  switch (intent) {
    case 'EatIntent': {
      return 'EatAction';
    }
    case 'BuyIntent': {
      return 'BuyAction';
    }
    case 'FinanceIntent': {
      return 'AchieveAction';
    }
    case 'FitnessIntent': {
      return 'ExerciseAction';
    }
    case 'TodoIntent': {
      return 'PlanAction';
    }
    case 'WorkIntent': {
      return 'CreateAction';
      // todo
      //  здесь же может быть акт перехода (MoveAction).
      //  пример: "пошел на работу в офис"
      //  MoveAction
    }
    // case 'InstallIntent': {
    // xxx
    // }
    // case 'PainIntent': {
    // todo https://schema.org/MedicalSymptom
    // break;
    // }
    // case 'WeightIntent': {
    // todo
    // break;
    // }
    // например когда "посмотрел фильм"
    // case 'WatchAction': {
    //   break;
    // }
    // настроение
    // case 'AssessAction': {
    //   break;
    // }
    // ??
    // это когда бот подключен к сторонним группам в телеграм
    // case 'InteractAction': {
    //   break;
    // }
    // case 'PlayAction': {
    //   break;
    // }
    // case 'SearchAction': {
    //   break;
    // }
    // пример работы с финансами
    // case 'TradeAction': {
    //   break;
    // }
    default: {
      return 'Action';
    }
  }
}
/**
 * @param {string} text - sentence text
 */
async function detectBySentense(text) {
  logger.info('detectBySentense');

  if (text.length > 256) {
    throw new Error('So big for detect');
  }

  /**
   * @param {string} action - JSON-LD action
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
      '@type': action,
      object, // todo в зависимости от контекста может быть либо 'object' либо 'result'

      // todo научить разбираться какой статус произошел по контексту
      // actionStatus: 'CompletedActionStatus'; // ActiveActionStatus, PotentialActionStatus
    };
    return innerDocument;
  }

  // todo возможно исключение, надо его правильно обработать
  // todo поменять uid
  const dialogflowResult = await dialogService.detect(text, 'test-uid');
  const parameters = dialogService.formatParameters(dialogflowResult);

  // ------------------------------------------
  // const { entities, language } = await languageService.analyzeEntities(text);

  // todo получение информации по локации
  // for (let entity of entities) {
  //   if (entity.type === 'LOCATION') {
  //     this.abstracts.push(new AbstractGeo({
  //       near: entity.name,
  //     }));
  //   }
  // }

  const { tokens } = await languageService.analyzeSyntax(
    dialogflowResult.queryText,
  );
  const objectNames = [];
  tokens.forEach((token) => {
    const { lemma } = token;

    // ------------------------------------------

    if (validator.isEmail(lemma)) {
      // this.abstracts.push(new AbstractEmail(lemma));
    } else if (validator.isMobilePhone(lemma)) {
      // this.abstracts.push(new AbstractPhone(lemma));
    } else if (validator.isURL(lemma)) {
      // this.abstracts.push(new AbstractLinks(lemma));
    }
    // TODO: names получить имена людей
    //  ...
    // TODO: получить адреса из текста
    //  ...
    // TODO: получить даты
    //  ...
    // TODO: behavior; анализируемое поведение. Анализируем введенный текст узнаем желания/намерение пользователя в более глубоком виде
    //  ...

    // ------------------------------------------

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
  });

  return generateDocument(
    convertIntentToActionName(dialogflowResult.intent.displayName),
  );
}
/**
 * @param {string} text - user text
 * @returns {Promise<Array<jsonld>>}
 */
module.exports = async ({
  // hashtags, // todo поддержать
  // chat_id, // todo поддержать
  tgMessageId,
  text,
  auth,
  creator,
  publisher,
  jwt,
}) => {
  const today = format(
    fromUnixTime(Math.round(new Date().getTime() / 1000)),
    'yyyy-MM-dd',
  );
  // todo использовать AbstractGeo для этого
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

  const document = {
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
    },
    '@type': 'Action', // ??? похоже так неправильно
    'agent': {
      '@type': 'Organization',
      'identifier': creator, // identifier assistant
    },
    'participant': {
      '@type': 'Person',
      'email': publisher, // identifier user
    },
    'startTime': today,
    'subjectOf': [],
    'object': {
      '@type': 'CreativeWork',
      'name': 'text',
      'abstract': encodeURIComponent(text).toString('base64'),
      'encodingFormat': 'text/plain',
      'provider': {
        '@type': 'Project',
        'identifier': {
          '@type': 'PropertyValue',
          'name': 'TelegramMessageId',
          'value': tgMessageId,
        },
      },
    },
    // location,
    // 'name': 'xxx', - это и будет тем самым спейсом?
  };

  for (const sentense of languageService.splitTextBySentences(text)) {
    /**
     * Разбор сообщения на типы (даты, имена, города, и т.д.)
     * поиск тела письма -> натурализация и сведение фактов в Истории -> оптимизация БД
     *
     * @returns {Promise<object>}
     */
    const subjectAction = await detectBySentense(sentense);
    document.subjectOf.push(subjectAction);
  }

  // todo это хэштеги. поддержать функциональность
  // const categories = new Set();
  // this.tags.forEach(tag => {
  //   categories.add(tag);
  // });

  const jsonldMessage = await rpc({
    body: {
      jsonrpc: '2.0',
      method: 'text',
      id: 1,
      params: document,
    },
    jwt,
    auth,
  });

  return jsonldMessage;
};
