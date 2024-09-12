const dialogflow = require('@google-cloud/dialogflow');
const activitystreams = require('telegram-bot-activitystreams');
const { v1: uuidv1 } = require('uuid');

const { DIALOGFLOW_CREDENTIALS } = process.env;
const DIALOGFLOW_LIMIT = 256;

const dfCredentials = JSON.parse(DIALOGFLOW_CREDENTIALS);

const sessionClient = new dialogflow.SessionsClient({
  credentials: dfCredentials,
});

class Dialog {
  static DIALOGFLOW_LIMIT = 256;
  /**
   * @class
   */
  constructor() {
    this._uid = uuidv1();
    this.messages = [];
  }
  /**
   * @param {object} message - telegram bot message
   */
  constructor(message) {
    message.from.language_code = 'ru'; // todo - пока поддерживаем только русский язык
    this._uid = uuidv1();
    this.message = message;
    this.activity = activitystreams(this.message);
  }
  /**
   * @returns {string}
   */
  get uid() {
    return this._uid;
  }
  set language(languageCode) {
    this._language = languageCode;
  }
  /**
   * @return {string}
   */
  get language() {
    // return this._language;
    return 'ru'; // todo пока используем только русский язык
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
          languageCode: this.language,
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
    if (text.length >= Dialog.DIALOGFLOW_LIMIT) {
      console.warn('Dialog text limit');
      text = text.slice(0, Dialog.DIALOGFLOW_LIMIT);
    }
    const request = {
      session: this.session,
      queryInput: {
        text: {
          text: text,
          languageCode: this.language,
        },
      },
    };
    return sessionClient.detectIntent(request);
  }
}

module.exports = Dialog;
