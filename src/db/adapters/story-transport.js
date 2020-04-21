const Transport = require('winston-transport');
const storyQueries = require('../selectors/story');
const { pool } = require('../sql');
const package_ = require('../../../package.json');
const TelegramNotifyError = require('../../core/models/errors/telegram-notify-error');

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
    const { document, passport } = info.message;

    // todo пока телега обязательна для записи
    const telegramMessageId = document.object.mainEntity.find((entity) => {
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
                version: package_.version,
                experimental: false, // todo включать для dev окружения
                // todo поддержать еще created_at
                // created_at: document.startTime,
              }),
            );
            // 'story.createContent'
            let rawContent;
            if (document.object.encodingFormat.endsWith('vnd.geo+json')) {
              rawContent = Buffer.from(document.object.abstract, 'utf8');
            } else if (document.object.encodingFormat.startsWith('text')) {
              rawContent = Buffer.from(document.object.abstract, 'utf8');
            } else {
              rawContent = Buffer.from(document.object.abstract, 'base64');
            }
            const contentTable = await transactionConnection.one(
              storyQueries.createContent({
                messageId: messageTable.id,
                content: rawContent,
                contentType: document.object.encodingFormat,
                schema: document.object['@type'],
                date: new Date(document.startTime), // created at
                // идея была в том чтобы хранить данные в СУБД, но лучше подойдет JENA
                telegramMessageId: String(telegramMessageId), // todo deprecated
                // emailMessageId: content.emailMessageId, // todo deprecated
              }),
            );
            for (const subject of document.subjectOf) {
              // 'story.createAbstract'
              await transactionConnection.query(
                storyQueries.createAbstract({
                  category: subject['@type'],
                  context: subject,
                  contentId: contentTable.id,
                }),
              );
            }
            await transactionConnection.query(storyQueries.refreshView());
            return messageTable;
          },
        );
        return result;
      });
      info.messageId = id;
      callback();
      setImmediate(() => {
        this.emit('logged', info);
      });
    } catch (error) {
      const telegramChatId = document.object.mainEntity.find((entity) => {
        return entity.name === 'TelegramChatId';
      })['value'];
      callback(
        new TelegramNotifyError(
          error.message,
          telegramMessageId,
          telegramChatId,
        ),
      );
    }
  }
};
