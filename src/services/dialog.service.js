const dialogflow = require('dialogflow');
const { DIALOGFLOW } = require('../environment');
const { detectLang } = require('./nlp.service');

/**
 * @param {string} query - query
 * @returns {string}
 */
const formatQuery = (query) => {
  /**
   * .5 -> 0.5
   *
   * @param {string} match - match
   * @param {number} matchIndex - index
   * @param {string} text - text
   * @returns {string}
   */
  function dotNumberReplacer(match, matchIndex, text) {
    if (matchIndex === 0) {
      match = '0' + match;
    } else if ([' '].includes(text[matchIndex - 1])) {
      match = '0' + match;
    }
    return match;
  }
  return query.trim().replace(/\.\d+/gm, dotNumberReplacer);
};

const search = async (rawMessage, uid) => {
  const query = formatQuery(rawMessage);
  const languageCode = detectLang(query).dialogflow;
  const sessionClient = new dialogflow.SessionsClient({
    credentials: DIALOGFLOW.DIALOGFLOW_CREDENTIALS_SEARCH,
  });
  const sessionPath = sessionClient.sessionPath(
    'prostodiarysearch-esmijx',
    uid,
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
  const responses = await sessionClient.detectIntent(request);
  return responses[0].queryResult;
};
/**
 * @example 'купил овощи 30 рублей';
 * @description получаем и разбираем Intent (если есть)
 * @param {string} rawMessage - raw message
 * @param {GUID|undefined} uid - uuid
 * @returns {Promise<string>}
 */
const detect = async (rawMessage, uid) => {
  const query = formatQuery(rawMessage);
  const languageCode = detectLang(query).dialogflow;
  const sessionClient = new dialogflow.SessionsClient({
    credentials: DIALOGFLOW.CREDENTIALS,
  });
  const sessionPath = sessionClient.sessionPath('prostodiary', uid);
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: query,
        languageCode: languageCode,
      },
    },
  };
  const responses = await sessionClient.detectIntent(request);
  return responses[0].queryResult;
};

module.exports = {
  detect,
  search,

  formatQuery,
};
