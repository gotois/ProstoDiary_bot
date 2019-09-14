const dialogflow = require('dialogflow');
const { detectLang } = require('./detect-language.service');
const { formatQuery } = require('./text.service');
const { DIALOGFLOW } = require('../environment');

const sessionClient = new dialogflow.SessionsClient({
  credentials: DIALOGFLOW.DIALOGFLOW_CREDENTIALS,
});
/**
 * Send request and log result
 *
 * @param {string} query - query
 * @returns {Promise<Array>}
 */
const detectTextIntent = async (query) => {
  const languageCode = detectLang(query).dialogflow;
  const sessionPath = sessionClient.sessionPath(
    DIALOGFLOW.DIALOGFLOW_PROJECT_ID,
    DIALOGFLOW.sessionId,
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
  const result = await sessionClient.detectIntent(request);
  return result;
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
  for (const response of responses) {
    const result = response.queryResult;
    return result;
  }
  // TODO: UNDEFINED INTENT? генерация undefined Intent
  // ...
};
/**
 * получаем и разбираем Intent (если есть)
 *
 * inputAnalyze('купил овощи 30 рублей');
 *
 * @param {string} rawMessage - raw message
 * @returns {Promise<string>}
 */
const inputAnalyze = async (rawMessage) => {
  const query = formatQuery(rawMessage);
  const responses = await detectTextIntent(query);
  const result = await processResponse(responses);
  return result;
};

module.exports = {
  inputAnalyze,
};
