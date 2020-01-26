const SchemaOrg = require('schema.org');
const format = require('date-fns/format');
const fromUnixTime = require('date-fns/fromUnixTime');
const linkedDataSignature = require('../services/linked-data-signature.service');
const dialogService = require('../services/dialog.service');
const languageService = require('../services/nlp.service');

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
    const actionStatus = 'CompletedActionStatus'; // ActiveActionStatus, PotentialActionStatus
    const agent = {
      '@type': 'Person',
      'name': 'Я', // всегда Я, если пишет сам пользователь. Если бот подклчен к паблику, то там отдельно надо
    };
    // set today
    const endTime = format(
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

    const object = {
      '@type': 'Thing',
      'name': objectNames[0], // в идеале должно браться из dialogflow, но если не получается, то берем существительное и прилагательное через NLP
      // image
      // description
    };
    // устанавливаем из endTime, если не получается установить startTime иным образом
    const startTime = endTime;

    const document = {
      // предполагаю что контекст будет создавать Space для каждого отдельного события это будет вида: 'https://gotointeractive.com/:object/:subject
      '@context': {
        schema: 'http://schema.org/',
        name: 'schema:name',
        actionStatus: 'schema:actionStatus',
        agent: 'schema:agent',
        endTime: 'schema:endTime',
        object: 'schema:object',
        startTime: 'schema:startTime',

        // специально для валидации schema
        ...Object.keys(parameters).reduce((accumulator, k) => {
          accumulator[k] = 'schema:' + k;
          return accumulator;
        }, {}),
      },
      '@type': action,

      actionStatus,
      agent,
      endTime,
      // error, : thing
      // instrument, : thing

      // location,

      object,
      //  participant
      // "result": { - добавляется если делается интернет покупка
      //   "@type": "Order",
      //   "url": "http://example.com/orders/1199334"
      //   "confirmationNumber": "1ABBCDDF23234",
      //   "orderNumber": "1199334",
      //   "orderStatus": "PROCESSING"
      // },
      startTime,
      // target

      // специально для увеличения типа schema
      ...parameters,
    };

    // todo нужно валидировать https://github.com/gotois/ProstoDiary_bot/issues/436
    // ...

    return document;
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
 * @param {string} text - user text
 * @param {object} parameters - parameters
 * @param {string} parameters.publicKeyPem - public key pem
 * @param {string} parameters.privateKeyPem - private key pem
 * @param {string} parameters.userId - user
 * @returns {Promise<Array<jsonld>>}
 */
module.exports = async (text, { publicKeyPem, privateKeyPem, userId }) => {
  const documents = [];
  for (const sentense of languageService.splitTextBySentences(text)) {
    const unsignedDocument = await detectBySentense(sentense);
    // подписанный JSON-LD может отсылаться ассистенту или храниться в БД
    const signedDocument = await linkedDataSignature.signDocument(
      unsignedDocument,
      publicKeyPem,
      privateKeyPem,
      userId,
    );
    // проверка на велидность подписанного JSON-LD например после отдачи ассистентом
    // const isVerified = await linkedDataSignature.verifyDocument(signedDoc, publicKeyPem, privateKeyPem, 'user-xxx');
    // console.log('Signature is ', isVerified);
    documents.push(signedDocument);

    // в дальнейшем предполагается что будет переводится в RDF
    // const jsonld = require('jsonld');
    // const rdf = await jsonld.toRDF(jsonResults[0]);
  }

  return documents;
};
