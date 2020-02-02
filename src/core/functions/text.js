const package_ = require('../../../package');
const SchemaOrg = require('schema.org');
const format = require('date-fns/format');
const fromUnixTime = require('date-fns/fromUnixTime');
const dialogService = require('../../services/dialog.service');
const languageService = require('../../services/nlp.service');

/**
 * @todo на основе набора свойств пытаюсь насытить schema.org
 * затем получать родителя из схемы и насыщать ее по необходимости из истории
 * example:
 * myForm({
 *   ...parameters,
 *   "availability": "http://schema.org/InStock",
 *   'priceCurrency': 'USD',
 *   'price': 900,
 * })
 * @param {object} parameters
 * @returns {object} - тип JSON-LD
 */
// eslint-disable-next-line
const myForm = (parameters) => {
  const schemaOrg = new SchemaOrg();
  const type = schemaOrg.getType(parameters);
  return {
    '@type': type,
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
  if (text.length > 256) {
    throw new Error('So big for detect');
  }

  /**
   * @param {string} action - JSON-LD action
   * @returns {object}
   */
  function generateDocument(action) {
    // fixme вычислять через NLP и в зависимости от выполнения
    // const actionStatus = 'CompletedActionStatus'; // ActiveActionStatus, PotentialActionStatus
    const object = {
      '@type': 'Thing',
      'name': objectNames[0], // в идеале должно браться из dialogflow, но если не получается, то берем существительное и прилагательное через NLP
    };

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
      object, // todo rename to result
      ...parameters,
    };

    return innerDocument;
  }

  // todo возможно исключение, надо его правильно обработать
  // todo поменять uid
  const dialogflowResult = await dialogService.detect(text, 'test-uid');

  // todo
  //  example start: когда будет готовы DialogFlow
  const parameters = dialogService.formatParameters(dialogflowResult);
  // myForm(parameters);
  // example end

  const { tokens } = await languageService.analyzeSyntax(
    dialogflowResult.queryText,
  );
  const objectNames = [];
  tokens.forEach((token) => {
    switch (token.partOfSpeech.tag) {
      // соединитель - союз, нужно увеличить возвращаемый массив на один
      // case 'CONJ': {
      //   resCount++;
      //   break;
      // }
      case 'NOUN': {
        objectNames.push(token.lemma);
        break;
      }
      default: {
        break;
      }
    }
  });

  const unsignedDocument = generateDocument(
    convertIntentToActionName(dialogflowResult.intent.displayName),
  );

  return unsignedDocument;
}

/**
 * @param {object} passport - parameters
 * @param {string} text - user text
 * @returns {Promise<Array<jsonld>>}
 */
module.exports = async (
  passport,
  text,
  // hashtags,
  // chat_id,
  // telegram_message_id,
) => {
  // todo поддержать hashtags, chat_id, telegram_message_id
  // ...

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
    },
    '@type': 'Action',
    'agent': {
      '@type': 'Person',
      'name': package_.name,
    },
    'startTime': today,
    'subjectOf': [],
    'object': {
      '@type': 'CreativeWork',
      'name': 'text',
      'abstract': text.toString('base64'),
      'encodingFormat': 'text/plain',
    },
    // location,
    // 'name': 'xxx', - это и будет тем самым спейсом?
  };

  for (const sentense of languageService.splitTextBySentences(text)) {
    const subjectAction = await detectBySentense(sentense);
    document.subjectOf.push(subjectAction);
  }

  return document;
};
