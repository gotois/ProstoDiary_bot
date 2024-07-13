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
   * @param {string} uid - uuid
   */
  constructor(message, uid) {
    this.message = message;
    this.uid = uid;
  }
  /**
   * @returns {string}
   */
  get session() {
    return sessionClient.projectAgentSessionPath(dfCredentials.project_id, this.uid);
  }
  /**
   * @param {Buffer} fileAudio - audio
   * @returns {Promise<object[]>}
   */
  voice(fileAudio) {
    const request = {
      session: this.session,
      queryInput: {
        audioConfig: {
          audioEncoding: 'AUDIO_ENCODING_OGG_OPUS',
          // eslint-disable-next-line
          sampleRateHertz: 48000,
          languageCode: this.message.from.language_code,
        },
      },
      inputAudio: fileAudio,
    };
    return sessionClient.detectIntent(request);
  }
  /**
   * @description Детектируем actions. Получаем и разбираем Intent (если есть)
   * @param {string} text - text
   * @returns {Promise<object[]>}
   */
  text(text) {
    if (text.length >= DIALOGFLOW_LIMIT) {
      console.warn('Dialog text limit');
      text = text.slice(0, DIALOGFLOW_LIMIT);
    }
    const request = {
      session: this.session,
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
