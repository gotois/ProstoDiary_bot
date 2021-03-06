const dialogflow = require('dialogflow');
const { DIALOGFLOW } = require('../environment');
const { detectLang } = require('./nlp.service');

/**
 * @todo перенести в core
 * @param {object} dialogflowResult - dialogflow result object
 * @returns {object}
 */
const formatParameters = (dialogflowResult) => {
  const { fields } = dialogflowResult.parameters;
  const values = Object.keys(fields).reduce((accumulator, field) => {
    const value = fields[field][fields[field].kind];
    // пропускаем пустые значения
    if (value.length > 0) {
      accumulator[field] = value;
    }
    // todo Автоисправление кастомных типов
    //  Например, "к" = "тысяча", преобразование кастомных типов "37C" = "37 Number Celsius"
    // ...
    return accumulator;
  }, {});
  return values;
};
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
/**
 * @param {string} query - query
 * @returns {string}
 */
const formatQuery = (query) => {
  return query.trim().replace(/\.\d+/gm, dotNumberReplacer);
};
/**
 * @param {string} rawMessage - raw message
 * @param {string} [uid] - uuid
 * @returns {Promise<string>}
 */
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
 * Детектируем actions
 *
 * @todo перенести в core
 * @example // произошла покупка
 * detect('купил овощи 30 рублей', 'xxx');
 *
 * @description получаем и разбираем Intent (если есть)
 * @param {string} rawMessage - raw message
 * @param {string} uid - uuid
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

/**
 * @param {Buffer} audio - audio buffer
 * @param {object} audioConfig - dialogflow audio config
 * @param {string} uid - uid session
 * @returns {Promise<*>}
 */
const detectAudio = async (audio, audioConfig, uid) => {
  const sessionClient = new dialogflow.SessionsClient({
    credentials: DIALOGFLOW.CREDENTIALS,
  });
  const sessionPath = sessionClient.sessionPath('prostodiary', uid);
  const request = {
    session: sessionPath,
    queryInput: {
      audioConfig: audioConfig,
    },
    inputAudio: audio,
  };
  const responses = await sessionClient.detectIntent(request);
  return responses[0].queryResult;
};

module.exports = {
  detect, // todo rename detectText
  detectAudio,
  search,

  formatQuery,
  formatParameters,
};
