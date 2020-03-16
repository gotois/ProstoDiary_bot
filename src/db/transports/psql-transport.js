const Transport = require('winston-transport');
const storyQueries = require('../story');
const passportQueries = require('../passport');
const { pool } = require('../database');
const package_ = require('../../../package');

module.exports = class PsqlTransport extends Transport {
  constructor(options) {
    super(options);
  }

  async log(info, callback) {
    const jsonld = info.message;

    try {
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
                // creator: jsonld.participant.email, // todo нужно получать ассистент GUID
                publisher: botTable.id,
                version: package_.version,
                experimental: false,
                // todo добавить еще created_at
              }),
            );
            // 'story.createContent'
            const contentTable = await transactionConnection.one(
              storyQueries.createContent({
                messageId: messageTable.id,
                content: Buffer.from(
                  decodeURIComponent(jsonld.object.abstract),
                ),
                contentType: jsonld.object.encodingFormat,
                schema: jsonld.object['@type'],
                telegramMessageId: String(
                  jsonld.object.provider.identifier.value,
                ),
                date: new Date(jsonld.startTime), // created at

                // todo добавить emailMessageId
                // emailMessageId: content.emailMessageId, // fixme поддержать
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
      info.message.id = id;
      callback();
    } catch (error) {
      callback(error);
    }

    setImmediate(() => {
      this.emit('logged', info);
    });
  }
};
