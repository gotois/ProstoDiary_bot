const activitystreams = require('telegram-bot-activitystreams');
const { v1: uuidv1 } = require('uuid');
const { saveMessage, getMessages, clearMessageById } = require('../models/messages.cjs');

/**
 * @class
 */
class Dialog {
  static from(user) {
    const dialog = new Dialog(user);
    return dialog;
  }
  /**
   * @param {object} user - Объект пользователя
   */
  constructor(user) {
    if (!user.timezone) {
      user.timezone = 'UTC';
    }
    this.user = user;
  }
  clear() {
    clearMessageById(this.user.id);
  }
  /**
   * @description Обрабатывает входящее сообщение и добавляет его в активность.
   * @param {object} message - Входящее сообщение.
   * @throws {Error} - Выбрасывает ошибку, если тип сообщения неизвестен.
   * @returns {void}
   */
  push(message) {
    this._uid = uuidv1(); // todo скорее всего он нужен не здесь
    saveMessage(message);
  }
  get activity() {
    const activities = {
      '@context': [
        'https://www.w3.org/ns/activitystreams',
        {
          '@language': this.user.language,
        },
      ],
      'summary': '',
      'type': 'Collection',
      'totalItems': 0,
      'items': [],
    };
    const messages = getMessages(this.user.id);
    for (let { message } of messages) {
      message = JSON.parse(message);
      const activity = activitystreams(message);
      activity.type = 'Activity';
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
      activities.totalItems++;
      activities.items.push(activity);
    }

    return activities;
  }
  /**
   * @returns {string}
   */
  get uid() {
    return this._uid;
  }
}

module.exports = Dialog;
