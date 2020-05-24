const { pool } = require('../../../db/sql');
const package_ = require('../../../../package.json');
const storyQueries = require('../../../db/selectors/story');
/**
 * @returns {Promise<any>}
 */
module.exports = async function ({ document, passport }) {
  try {
    let rawContent;
    if (document.result.encodingFormat.endsWith('vnd.geo+json')) {
      rawContent = Buffer.from(document.result.abstract, 'utf8');
    } else if (document.result.encodingFormat.startsWith('text')) {
      rawContent = Buffer.from(document.result.abstract, 'utf8');
    } else {
      rawContent = Buffer.from(document.result.abstract, 'base64');
    }
    // todo пока телега обязательна для записи
    const telegramMessageId = document.result.mainEntity.find((entity) => {
      return entity.name === 'TelegramMessageId';
    })['value'];

    const result = await pool.connect(async (connection) => {
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
    return Promise.resolve(result);
  } catch (error) {
    return Promise.reject(this.error(400, error.message, error));
  }
};
