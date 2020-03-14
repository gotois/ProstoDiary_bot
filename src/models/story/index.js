const ContentPhoto = require('../content/content-photo');
const logger = require('../../services/logger.service');

class Story {
  /**
   * @constant
   * @type {{CORE: string, HARD: string, SOFT: string, UNTRUSTED: string}}
   */
  static get INPUT_TYPE() {
    return {
      UNTRUSTED: 'UNTRUSTED',
      SOFT: 'SOFT',
      HARD: 'HARD',
      CORE: 'CORE',
    };
  }
  /**
   * Читаем аттачи письма и на их основе формируем машинные значения
   *
   * @param {Mail} mail mail
   */
  constructor(mail) {
    this.mail = mail;
    this.from = mail.from;
    this.to = mail.to;
    this.uid = mail.uid;
    this.contents = [];

    for (const attachment of mail.attachments) {
      let content;
      switch (attachment.contentType) {
        case 'plain/text': {
          break;
        }
        case 'image/png':
        case 'image/jpeg': {
          content = new ContentPhoto({
            ...attachment,
            emailMessageId: mail.messageId,
            telegramMessageId: mail.telegram_message_id,
            schema: mail.subject,
            tags: mail.headers['x-bot-tags']
              ? JSON.parse(mail.headers['x-bot-tags'])
              : [],
          });
          break;
        }
        case 'text/html': {
          break;
        }
        case 'application/vnd.geo+json': {
          // это передача GeoJSON
          // see https://sgillies.net/2014/05/22/the-geojson-media-type.html
          break;
        }
        case 'application/pdf': {
          break;
        }
        case 'application/xml': {
          break;
        }
        case 'application/zip':
        case 'multipart/x-zip': {
          break;
        }
        case 'application/octet-stream': {
          break;
        }
        default: {
          logger.warn('info', 'Unknown mime type ' + contentType);
        }
      }
    }
  }
}

module.exports = Story;
