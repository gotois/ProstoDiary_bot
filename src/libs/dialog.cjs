const dialogflow = require('@google-cloud/dialogflow');
const activitystreams = require('telegram-bot-activitystreams');
const { v1: uuidv1 } = require('uuid');

const { DIALOGFLOW_CREDENTIALS } = process.env;

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
    this.activity = {
      '@context': ['https://www.w3.org/ns/activitystreams'],
      'summary': '',
      'type': 'Collection',
      'totalItems': 0,
      'items': [],
    };
  }
  /**
   * @param {object} message - telegram bot message
   */
  async push(message) {
    const activity = activitystreams(message);
    // this.language = message.from.language_code;
    this.language = 'ru'; // todo пока используем только русский

    if (message.voice) {
      const response = await fetch(message.voice.file.url);
      const arrayBuffer = await response.arrayBuffer();
      const [{ queryResult }] = await this.voice(Buffer.from(arrayBuffer));
      this.language = queryResult.languageCode;
      activity.type = 'Activity'; // todo - обучить DialogFlow возвращать Intents с содержанием из списка: https://www.w3.org/TR/activitystreams-vocabulary/#h-types
      switch (queryResult.intent.displayName) {
        default: {
          activity.object = [
            {
              type: 'Note',
              content: queryResult.queryText,
              mediaType: 'text/plain',
            },
          ];
          break;
        }
      }
    } else if (message.text) {
      const [{ queryResult }] = await this.text(message.text);
      activity.type = 'Activity'; // todo - обучить DialogFlow возвращать Intents с содержанием из списка: https://www.w3.org/TR/activitystreams-vocabulary/#h-types
      this.language = queryResult.languageCode;
    } else if (message.photo) {
    } else if (message.location) {
      activity.object = [
        {
          type: 'Point',
          content: {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [message.location.latitude, message.location.longitude],
            },
          },
          mediaType: 'application/geo+json',
        },
      ];
      if (message.location.caption) {
        const [{ queryResult }] = await this.text(message.location.caption);
        this.language = queryResult.languageCode;
        activity.object.push({
          type: 'Note',
          content: message.location.caption,
          mediaType: 'text/plain',
        });
      }
    } else if (message.document) {
      // const response = await fetch(message.document.file.url);
      // const arrayBuffer = await response.arrayBuffer();
    } else if (message.sticker) {
    } else if (message.video_note) {
    } else {
      console.warn(message);
      throw new Error('Unknown type message');
    }
    this.activity.totalItems++;
    this.activity.items.push(activity);
  }
  /**
   * @returns {string}
   */
  get uid() {
    return this._uid;
  }
  set language(languageCode) {
    // todo - добавлять только если такого еще нет в списке
    this.activity['@context'].push({
      '@language': languageCode,
    });
  }
  /**
   * @returns {string}
   */
  get language() {
    return this.activity['@context'].reduce((accumulator, element) => {
      if (element['@language']) {
        return element['@language'];
      }
    });
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
