const activitystreams = require('telegram-bot-activitystreams');
const { v1: uuidv1 } = require('uuid');
const { saveMessage, getMessages, clearMessageById } = require('../models/messages.cjs');

/**
 * @class
 */
class Dialog {
  /**
   * @param {object} user - Объект пользователя
   */
  constructor(user) {
    this.user = user;
    this.clear();
    const x = getMessages(user.id);
  }
  clear() {
    clearMessageById(this.user.id);
    this._activity = {
      '@context': ['https://www.w3.org/ns/activitystreams'],
      'summary': '',
      'type': 'Collection',
      'totalItems': 0,
      'items': [],
    };
  }
  /**
   * @description Обрабатывает входящее сообщение и добавляет его в активность.
   * @param {object} message - Входящее сообщение.
   * @returns {object} - Возвращает объект активности.
   */
  push(message) {
    this._uid = uuidv1();
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
    this._activity.totalItems++;
    this._activity.items.push(activity);

    return activity;
  }
  /**
   * @param {object} message - объект сообщения
   * @param {number} message.messageId - идентификатор сообщения
   * @param {string} message.chatId - идентификатор чата
   * @param {string} message.text - текст сообщения
   * @param {'user' | 'assistant'} message.role - роль отправителя
   * @returns {void}
   */
  saveMessage(message) {
    saveMessage(message);
  }
  get activity() {
    return this._activity;
  }
  /**
   * @returns {string}
   */
  get uid() {
    return this._uid;
  }
  set language(languageCode) {
    const hasLang = this._activity['@context'].some((c) => {
      return c && c['@language'] === languageCode;
    });
    if (!hasLang) {
      this._activity['@context'].push({
        '@language': languageCode,
      });
    }
  }
  /**
   * @returns {string}
   */
  get language() {
    // eslint-disable-next-line unicorn/no-array-reduce
    return this._activity['@context'].reduce((accumulator, element) => {
      if (element['@language']) {
        return element['@language'];
      }
    });
  }
}

module.exports = Dialog;
