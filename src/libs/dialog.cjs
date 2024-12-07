const activitystreams = require('telegram-bot-activitystreams');
const { v1: uuidv1 } = require('uuid');

class Dialog {
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
   * Обрабатывает входящее сообщение и добавляет его в активность.
   *
   * @param {object} message - Входящее сообщение.
   * @returns {object} - Возвращает объект активности.
   */
  push(message) {
    const activity = activitystreams(message);
    activity.type = 'Activity';
    this.language = message.from.language_code;

    if (message.voice) {
      // ...
    } else if (message.text) {
      // ...
    } else if (message.photo) {
      // ...
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
        activity.object.push({
          type: 'Note',
          content: message.location.caption,
          mediaType: 'text/plain',
        });
      }
    } else if (message.document) {
      // ...
    } else if (message.sticker) {
      // ...
    } else if (message.video_note) {
      // ...
    } else if (message.audio) {
      // ...
    } else if (message.contact) {
      // ...
    } else {
      console.error(message);
      throw new Error('Unknown type message');
    }
    this.activity.totalItems++;
    this.activity.items.push(activity);

    return activity;
  }
  /**
   * @returns {string}
   */
  get uid() {
    return this._uid;
  }
  set language(languageCode) {
    const hasLang = this.activity['@context'].some((c) => {
      return c && c['@language'] === languageCode;
    });
    if (!hasLang) {
      this.activity['@context'].push({
        '@language': languageCode,
      });
    }
  }
  /**
   * @returns {string}
   */
  get language() {
    // eslint-disable-next-line unicorn/no-array-reduce
    return this.activity['@context'].reduce((accumulator, element) => {
      if (element['@language']) {
        return element['@language'];
      }
    });
  }
}

module.exports = Dialog;
