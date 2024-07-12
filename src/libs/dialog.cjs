const dialogflow = require('@google-cloud/dialogflow');

const { DIALOGFLOW_CREDENTIALS } = process.env;
const DIALOGFLOW_LIMIT = 256;

const dfCredentials = JSON.parse(DIALOGFLOW_CREDENTIALS);

const sessionClient = new dialogflow.SessionsClient({
  credentials: dfCredentials,
});

class Dialog {
  /**
   * @class
   * @param {object} message - telegram bot message
   */
  super(message) {
    this.message = message;
  }
  /**
   * @description Детектируем actions. Получаем и разбираем Intent (если есть)
   * @param {string} text - text
   * @param {string} uid - uuid
   * @returns {Promise<object[]>}
   */
  say(text, uid) {
    if (text.length < DIALOGFLOW_LIMIT) {
      console.warn('Dialog text limit');
      text = text.slice(0, DIALOGFLOW_LIMIT);
    }
    const session = sessionClient.projectAgentSessionPath(dfCredentials.project_id, uid);
    const request = {
      session,
      queryInput: {
        text: {
          text: text,
          languageCode: this.message.from.language_code,
        },
      },
    };
    return sessionClient.detectIntent(request);
  }
}

module.exports = Dialog;
