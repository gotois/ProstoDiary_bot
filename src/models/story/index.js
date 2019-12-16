const ContentText = require('../content/content-text');
const ContentPhoto = require('../content/content-photo');
const logger = require('../../services/logger.service');
const storyQueries = require('../../db/story');
const { pool } = require('../../core/database');

class Story {
  /**
   * https://github.com/gotois/ProstoDiary_bot/issues/152#issuecomment-527747303
   *
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
  // todo сверяем subject с установленными правилами и на основе их пересечения бот будет совершать то или иное действие
  analyzeSubject () {
    // tagName = tagName.replace('Intent', '').toLowerCase();
    console.log('subject', this.mail.subject);
  };
  /**
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
          content = new ContentText({
            ...attachment,
            emailMessageId: mail.messageId,
            telegramMessageId: mail.telegram_message_id,
          });
          break;
        }
        case 'text/html': {
          // abstract = new AbstractHTML(attachment);
          break;
        }
        case 'application/vnd.geo+json': {
          // это передача GeoJSON
          // see https://sgillies.net/2014/05/22/the-geojson-media-type.html
          break;
        }
        case 'image/png':
        case 'image/jpeg': {
          content = new ContentPhoto({
            ...attachment,
            emailMessageId: mail.messageId,
            telegramMessageId: mail.telegram_message_id,
          });
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
      if (content) {
        this.contents.push(content);
      }
    }
  }

  async commit() {
    const action = this.analyzeSubject();

    await pool.connect(async (connection) => {
      await connection.transaction(async (transactionConnection) => {
        // message
        const messageTable = await transactionConnection.one(
          storyQueries.createMessage({
            creator: this.from.value[0].name,
            publisher: this.to.value[0].name,
            experimental: this.mail.experimental,
            version: this.mail.headers['x-bot-version'],
          })
        );
        // content
        for (const content of this.contents) {
          await content.prepare();
          const contentTable = await transactionConnection.one(storyQueries.createContent({
            content: content.content,
            contentType: content.contentType,
            date: this.mail.date,
            emailMessageId: content.emailMessageId,
            telegramMessageId: content.telegramMessageId,
            messageId: messageTable.id,
          }));
          // abstract
          for (const abstract of content.abstracts) {
            await abstract.prepare();
            await transactionConnection.query(storyQueries.createAbstract({
              category: 'finance', // fixme undefined example
              context: JSON.stringify(abstract.context),
              contentId: contentTable.id,
            }));
          }
        }
        // refresh materialized view
        await transactionConnection.query(storyQueries.refreshView());
      });
    });
  }
}

module.exports = Story;
