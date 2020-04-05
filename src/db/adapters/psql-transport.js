const Transport = require('winston-transport');
const storyQueries = require('../selectors/story');
const passportQueries = require('../selectors/passport');
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
    const { document } = info.message;
    try {
      // this.assumeBox(document);
      const { id } = await pool.connect(async (connection) => {
        const result = await connection.transaction(
          async (transactionConnection) => {
            // 'story.createMessage'

            // todo нужно получать ассистент GUID
            // const assistantId = await transactionConnection.one(sql`
            //   select * from assistant where
            // `);
            const botTable = await connection.one(
              passportQueries.selectBotByEmail(document.participant.email),
            );
            // 'story.botTable'
            const messageTable = await transactionConnection.one(
              storyQueries.createMessage({
                namespace: document['@id'],
                // creator: jsonld.participant.email, // todo нужно получать идентификатор ассистента GUID
                publisher: botTable.id,
                version: package_.version,
                experimental: false,
                // todo добавить еще created_at
              }),
            );
            // 'story.createContent'
            const telegramMessageId = document.object.mainEntity.find(
              (entity) => {
                return entity.name === 'TelegramMessageId';
              },
            )['value'];
            const contentTable = await transactionConnection.one(
              storyQueries.createContent({
                messageId: messageTable.id,
                content: Buffer.from(
                  decodeURIComponent(document.object.abstract),
                ),
                contentType: document.object.encodingFormat,
                schema: document.object['@type'],
                telegramMessageId: String(telegramMessageId),
                date: new Date(document.startTime), // created at
                // emailMessageId: content.emailMessageId, // fixme поддержать emailMessageId
              }),
            );
            for (const subject of document.subjectOf) {
              // 'story.createAbstract'
              await transactionConnection.query(
                storyQueries.createAbstract({
                  category: subject['@type'],
                  context: JSON.stringify(subject),
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
      const telegramMessageId = document.object.mainEntity.find((entity) => {
        return entity.name === 'TelegramMessageId';
      })['value'];
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
