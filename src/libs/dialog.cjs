const dialogflow = require('@google-cloud/dialogflow');

const { DIALOGFLOW_CREDENTIALS } = process.env;
const DIALOGFLOW_LIMIT = 256;

const dfCredentials = JSON.parse(DIALOGFLOW_CREDENTIALS);

const sessionClient = new dialogflow.SessionsClient({
  credentials: dfCredentials,
});

class Dialog {
  constructor(message) {
    if (message.text.length < DIALOGFLOW_LIMIT) {
      throw 'Dialog text limit';
    }
    this.message = message;
  }
  /**
   * @description Детектируем actions. Получаем и разбираем Intent (если есть)
   * @param {object} message - bot message
   * @param {string} uid - uuid
   * @returns {Promise<object[]>}
   */
  async detectAction(message, uid) {
    const session = sessionClient.projectAgentSessionPath(dfCredentials.project_id, uid);
    const request = {
      session,
      queryInput: {
        text: {
          text: message.text,
          languageCode: message.from.language_code,
        },
      },
    };
    return sessionClient.detectIntent(request);
  }
}

module.exports = Dialog;
