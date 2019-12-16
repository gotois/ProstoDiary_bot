const dialogflow = require('dialogflow');
const { detectLang } = require('../services/nlp.service');
const { DIALOGFLOW } = require('../environment');

const sessionClient = new dialogflow.SessionsClient({
  credentials: DIALOGFLOW.CREDENTIALS,
});
/**
 * .5 -> 0.5
 *
 * @param {string} match - match
 * @param {number} matchIndex - index
 * @param {string} text - text
 * @returns {string}
 */
const dotNumberReplacer = (match, matchIndex, text) => {
  if (matchIndex === 0) {
    match = '0' + match;
  } else if ([' '].includes(text[matchIndex - 1])) {
    match = '0' + match;
  }
  return match;
};
/**
 * @param {string} query - query
 * @returns {string}
 */
const formatQuery = (query) => {
  return query.trim().replace(/\.\d+/gm, dotNumberReplacer);
};
/**
 * @description Send request and log result
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
 * @example inputAnalyze('купил овощи 30 рублей');
 *
 * @description получаем и разбираем Intent (если есть)
 * @param {string} rawMessage - raw message
 * @returns {Promise<string>}
 */
const inputAnalyze = async (rawMessage) => {
  const query = formatQuery(rawMessage);
  const [response] = await detectTextIntent(query);
  return response.queryResult;
};

const detectIntentAudio = () => {
  // todo
};

module.exports = {
  detectTextIntent: inputAnalyze,
  detectIntentAudio,
  formatQuery,
  // todo: расширить встроенными методами https://github.com/googleapis/nodejs-dialogflow
  // todo add createContext
};
