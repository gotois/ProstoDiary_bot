const INTENTS = require('../../core/intents');
const AbstractText = require('../../models/abstract/abstract-text');
const logger = require('../../services/logger.service');

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
    console.log('subject', this.subject);
  };
  /**
   * @param {*} body
   * @param {string}  contentType
   */
  append (body, contentType) {
    let abstract;
    switch (contentType) {
      case 'text/html': {
        // abstract = new AbstractHTML(body);
        break;
      }
      case 'plain/text': {
        abstract = new AbstractText(body);
        break;
      }
      case 'image/png':
      case 'image/jpeg': {
        //  abstract = new AbstractPhoto(body);
        break;
      }
      case 'application/pdf': {
        //  abstract = new AbstractPDF(body);
        break;
      }
      case 'application/xml': {
        //  abstract = new AbstractXML(body);
        break;
      }
      case 'application/zip':
      case 'multipart/x-zip': {
        //  abstract = new AbstractZip(body);
        break;
      }
      case 'application/octet-stream': {
        //  abstract = new AbstractText(body);
        break;
      }
      default: {
        logger.warn('info', 'Unknown mime type ' + contentType);
      }
    }
    this.abstracts.push(abstract);
  }
  /**
   * @param {object} params - params
   * @param {string} params.subject
   * @param {string} params.contentType
   * @param {uid} params.uid
   */
  constructor(subject, uid) {
    this.subject = subject;
    this.uid = uid;
    this.abstracts = [];
  }
  /**
   * @description Operation Definition (Типизация абстрактов в строгий структурный вид) - формируем Конечный состав параметров, включающий undefined если нигде не получилось ничего найти
   * Единый ответ для записи истории как для бота, так и для пользователя
   *
   * @returns {object}
   */
  toJSON () {
    return {
      // type: this.type,
      // tags: this.tags,
      // raw: this.raw,
      // version: this.version,
      // jurisdiction: this.jurisdiction,
      // timestamp: this.timestamp,
      // creator: this.creator,
      // publisher: this.publisher,
      // telegram_bot_id: this.telegram_bot_id,
      // telegram_user_id: this.telegram_user_id,
      // telegram_message_id: this.telegram_message_id,
      // email_message_id: this.email_message_id,
      // telegram_user_id: this.telegram_user_id,
      // telegram_message_id: this.telegram_message_id,
      // todo: сюда же добавляется subject из письма
      // todo: сюда же добавляется raw - ссылка на исходик (в письме аттача или типо того)
      // todo: канонический урл - url
      // todo: bot blockchain sign
    };
  }
  async precommit() {
    const action = this.analyzeSubject();

    for (const abstract of this.abstracts) {
      await abstract.commit(action);
    }
  }
  // todo: прямо здесь делать запросы на сохранение в БД
  async commit() {
    await this.precommit();

    console.log('next');

    // todo save story.toJSON() to Database
    // await pool.connect(async (connection) => {
    //   await connection.transaction(async (transactionConnection) => {
    //     const messageId = await transactionConnection.query(sql`
    //       INSERT INTO message
    //       (uid, url, telegram_message_id)
    //       VALUES (${this.mail_uid}, ${2}, ${this.telegram_message_id})
    //       RETURNING id`
    //     );
    //     const creatorId = transactionConnection.maybeOne(sql`
    //       SELECT id FROM jsonld WHERE email = ${this.creator}`
    //     );
    //     if (!creatorId) {
    //       // todo: делать заполнение jsonld новой персоной
    //     }
    //     const publisherId = transactionConnection.maybeOne(sql`
    //       SELECT id FROM jsonld WHERE email = ${this.publisher}`
    //     );
    //     await transactionConnection.query(sql`
    //       INSERT INTO abstract
    //       (created_at, type, tags, mime, version, context, message_id, creator_id, publisher_id)
    //       VALUES (${this.timestamp}, ${this.type}, ${sql.array(this.tags, sql`text[]`)}, ${this.mime}, ${this.version}, ${this.context}, ${messageId}, ${creatorId}, ${publisherId})
    //       RETURNING *`
    //     );
    //   });
    // });

    return this.toJSON();
  }
}

module.exports = Story;
