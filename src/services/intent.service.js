const dialogflow = require('dialogflow');
const { getLangCodeFromQuery } = require('./detect-language.service');
const { formatQuery } = require('./text.service');
const INTENTS = require('../intents');
const { DIALOGFLOW } = require('../env');
// const language = require('../services/language.service');

const sessionClient = new dialogflow.SessionsClient({
  credentials: DIALOGFLOW.DIALOGFLOW_CREDENTIALS,
});
/**
 * Send request and log result
 *
 * @param {string} sessionId - session id
 * @param {string} query - query
 * @returns {Promise<Array>}
 */
const detectTextIntent = async ({ sessionId, query }) => {
  const languageCode = getLangCodeFromQuery(query);
  const sessionPath = sessionClient.sessionPath(
    DIALOGFLOW.DIALOGFLOW_PROJECT_ID,
    sessionId,
  );
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: query,
        languageCode: languageCode,
      },
    },
  };
  const res = await sessionClient.detectIntent(request);
  return res;
};
/**
 * TODO: получаю имя и значение Intent
 * TODO: нужно покрыть тестами
 * на основе этого делаю записи в нужные части БД (сохраняя при этом стандартный rawMsg)
 *
 * @param {Array} responses - responses array
 * @returns {string}
 */
const processResponse = (responses) => {
  for (const res of responses) {
    const result = res.queryResult;

    if (result.intent) {
      switch (result.intent.name) {
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
  }
  return '';
};
/**
 * получаем и разбираем Intent (если есть)
 *
 * TODO: на основе Intent'a делаем различные предположения и записываем в БД в структурированном виде
 * анализируем введенный текст узнаем желания/намерение пользователя в более глубоком виде
 * await language.analyze(input);
 *
 * @param {string} rawMsg - купил овощи 30 рублей
 * @returns {Promise<string>}
 */
const inputAnalyze = async (rawMsg) => {
  const sessionId = 'quickstart-session-id';
  const query = formatQuery(rawMsg);
  const responses = await detectTextIntent({ sessionId, query });
  const res = await processResponse(responses);
  return res;
};

module.exports = {
  inputAnalyze,
};
