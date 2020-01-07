const ContentText = require('../content/content-text');
const ContentPhoto = require('../content/content-photo');
const logger = require('../../services/logger.service');
const storyQueries = require('../../db/story');
const { pool } = require('../../core/database');

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
            schema: mail.subject,
            tags: mail.headers['x-bot-tags'] ? JSON.parse(mail.headers['x-bot-tags']) : [],
          });
          break;
        }
        case 'image/png':
        case 'image/jpeg': {
          content = new ContentPhoto({
            ...attachment,
            emailMessageId: mail.messageId,
            telegramMessageId: mail.telegram_message_id,
            schema: mail.subject,
            tags: mail.headers['x-bot-tags'] ? JSON.parse(mail.headers['x-bot-tags']) : [],
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
    logger.info('story.commit');

    let id;
    await pool.connect(async (connection) => {
      await connection.transaction(async (transactionConnection) => {
        logger.info('story.createMessage');
        const messageTable = await transactionConnection.one(
          storyQueries.createMessage({
            creator: this.from.value[0].name,
            publisher: this.to.value[0].name,
            experimental: this.mail.experimental,
            version: this.mail.headers['x-bot-version'],
          })
        );
        for (const content of this.contents) {
          logger.info('story.createContent');
          await content.prepare();
          const contentTable = await transactionConnection.one(storyQueries.createContent({
            content: content.content,
            contentType: content.contentType,
            date: this.mail.date,
            emailMessageId: content.emailMessageId,
            telegramMessageId: content.telegramMessageId,
            messageId: messageTable.id,
            schema: content.schema.toLowerCase().replace(/intent$/, ''),
          }));
          for (const abstract of content.abstracts) {
            logger.info('story.createAbstract');
            await abstract.prepare();
            await transactionConnection.query(storyQueries.createAbstract({
              category: abstract.category,
              context: JSON.stringify(abstract.context), // todo переделать под формат JSON-LD
              contentId: contentTable.id,
            }));
          }
        }
        id = messageTable.id;
        await transactionConnection.query(storyQueries.refreshView());
      });
    });
    if (id) {
      return id;
    }
    throw new Error('story returns undefined id');
  }
}

module.exports = Story;
