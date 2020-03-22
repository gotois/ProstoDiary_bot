const Transport = require('winston-transport');
const storyQueries = require('../story');
const passportQueries = require('../passport');
const { pool } = require('../database');
const package_ = require('../../../package.json');

// todo перенести в models
class TelegramNotifyError extends Error {
  constructor(message, telegramMessageId, chatId) {
    super(message);
    this.name = 'TelegramNotifyError';
    this.chatId = chatId;
    this.messageId = telegramMessageId;
  }
}

// здесь данные о принятии решений: производить запись или нет
// eslint-disable-next-line
const assumeBox = (jsonld) => {
  return void 0;
};

class PsqlTransport extends Transport {
  constructor(options) {
    super(options);
  }

  async log(info, callback) {
    try {
      const jsonld = info.message;
      assumeBox(jsonld);

      const { id } = await pool.connect(async (connection) => {
        const result = await connection.transaction(
          async (transactionConnection) => {
            // 'story.createMessage'

            // todo нужно получать ассистент GUID
            // const assistantId = await transactionConnection.one(sql`
            //   select * from assistant where
            // `);
            const botTable = await connection.one(
              passportQueries.selectBotByEmail(jsonld.participant.email),
            );
            // 'story.botTable'
            const messageTable = await transactionConnection.one(
              storyQueries.createMessage({
                namespace: jsonld['@id'],
                // creator: jsonld.participant.email, // todo нужно получать идентификатор ассистента GUID
                publisher: botTable.id,
                version: package_.version,
                experimental: false,
                // todo добавить еще created_at
              }),
            );
            // 'story.createContent'
            const telegramMessageId = jsonld.object.mainEntity.find(
              (entity) => {
                return entity.name === 'TelegramMessageId';
              },
            )['value'];
            const contentTable = await transactionConnection.one(
              storyQueries.createContent({
                messageId: messageTable.id,
                content: Buffer.from(
                  decodeURIComponent(jsonld.object.abstract),
                ),
                contentType: jsonld.object.encodingFormat,
                schema: jsonld.object['@type'],
                telegramMessageId: String(telegramMessageId),
                date: new Date(jsonld.startTime), // created at

                // emailMessageId: content.emailMessageId, // fixme поддержать emailMessageId
              }),
            );
            for (const subject of jsonld.subjectOf) {
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
      const telegramMessageId = info.message.object.mainEntity.find(
        (entity) => {
          return entity.name === 'TelegramMessageId';
        },
      )['value'];
      const telegramChatId = info.message.object.mainEntity.find((entity) => {
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
}

module.exports = PsqlTransport;
