const Transport = require('winston-transport');
const storyQueries = require('../selectors/story');
const { pool } = require('../sql');
const package_ = require('../../../package.json');
const { SERVER } = require('../../environment');
const AcceptAction = require('../../core/models/action/accept');
const RejectAction = require('../../core/models/action/reject');
const AuthorizeAction = require('../../core/models/action/authorize');
const logger = require('../../lib/log');
const textService = require('../../services/text.service');

module.exports = class PsqlTransport extends Transport {
  constructor(options) {
    super(options);
  }
  // здесь данные о принятии решений: производить запись или нет
  // eslint-disable-next-line
  assumeBox(document) {
    return void 0;
  }
  /**
   * @param {object} info - info
   * @param {Function} callback - callback
   * @returns {Promise<void>}
   */
  async log(info, callback) {
    const { document, marketplace, passport } = info.message;
    let rawContent;
    let preContent;
    if (document.result.encodingFormat.endsWith('vnd.geo+json')) {
      rawContent = Buffer.from(document.result.abstract, 'utf8');
      preContent = 'posting geo';
    } else if (document.result.encodingFormat.startsWith('text')) {
      rawContent = Buffer.from(document.result.abstract, 'utf8');
      preContent = document.result.abstract;
    } else {
      rawContent = Buffer.from(document.result.abstract, 'base64');
      preContent = 'posting buffer';
    }
    this.emit(
      'pre-logged',
      AuthorizeAction({
        agent: document.agent,
        mainEntity: document.result.mainEntity,
        result: {
          encodingFormat: 'text/markdown',
          abstract: `_${textService.previousInput(preContent)}_ 📝`,
        },
      }),
      {
        user: marketplace.client_id,
        pass: marketplace.client_secret,
        sendImmediately: false,
      },
    );

    // todo пока телега обязательна для записи
    const telegramMessageId = document.result.mainEntity.find((entity) => {
      return entity.name === 'TelegramMessageId';
    })['value'];

    try {
      // this.assumeBox(document);
      const { id } = await pool.connect(async (connection) => {
        const result = await connection.transaction(
          async (transactionConnection) => {
            // 'story.createMessage'
            const messageTable = await transactionConnection.one(
              storyQueries.createMessage({
                namespace: document['@id'],
                creator: passport.email, // todo дополнить `document.participant.email` когда переведу на массив
                publisher: document.agent.email,
                version: package_.version, // todo брать это из instrument
                experimental: false, // todo включать для dev окружения
                // todo поддержать еще created_at
                // created_at: document.startTime,
              }),
            );
            // 'story.createContent'
            const contentTable = await transactionConnection.one(
              storyQueries.createContent({
                messageId: messageTable.id,
                content: rawContent,
                contentType: document.result.encodingFormat,
                schema: document.result['@type'],
                date: new Date(document.startTime), // created at
                // идея была в том чтобы хранить данные в СУБД, но лучше подойдет JENA
                telegramMessageId: String(telegramMessageId), // todo deprecated
                // emailMessageId: content.emailMessageId, // todo deprecated
              }),
            );
            for (const subject of document.object) {
              // 'story.createAbstract'
              await transactionConnection.query(
                storyQueries.createAbstract({
                  category: subject['@type'],
                  context: subject,
                  contentId: contentTable.id,
                }),
              );
            }
            return messageTable;
          },
        );
        await connection.query(storyQueries.refreshView());
        return result;
      });
      info.messageId = id;
      callback();
      setImmediate(() => {
        logger.warn(id);
        this.emit(
          'logged',
          AcceptAction({
            result: {
              '@type': 'Answer',
              'abstract': 'Запись добавлена',
              'encodingFormat': 'text/html',
              'text': 'Открыть запись',
              'url': `${SERVER.HOST}/message/${passport.email}/${id}`,
            },
            agent: document.agent,
            participant: {
              email: passport.email,
            },
            mainEntity: document.result.mainEntity,
          }),
          {
            user: marketplace.client_id,
            pass: marketplace.client_secret,
            sendImmediately: false,
          },
        );
      });
    } catch (error) {
      callback(
        RejectAction({
          message: error.message,
          agent: document.agent,
          mainEntity: document.result.mainEntity,
        }),
        {
          user: marketplace.client_id,
          pass: marketplace.client_secret,
          sendImmediately: false,
        },
      );
    }
  }
};
