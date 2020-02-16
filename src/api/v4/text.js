const { SERVER } = require('../../environment');
const package_ = require('../../../package');
const logger = require('../../services/logger.service');
// const linkedDataSignature = require('../../services/linked-data-signature.service');
const storyQueries = require('../../db/story');
const passportQueries = require('../../db/passport');
const { pool, sql } = require('../../db/database');

const assumeBox = (jsonld) => {
  // здесь данные о принятии решений: производить запись или нет
  return void 0;
};

const saveToDatabase = async (jsonld) => {
  logger.info('saveToDatabase');

  const { id } = await pool.connect(async (connection) => {
    const result = await connection.transaction(
      async (transactionConnection) => {
        logger.info('story.createMessage');

        // todo нужно получать ассистент GUID
        // const assistantId = await transactionConnection.one(sql`
        //   select * from assistant where
        // `);
        const botTable = await connection.one(
          passportQueries.selectBotByEmail(jsonld.participant.email),
        );

        logger.info('story.botTable');

        const messageTable = await transactionConnection.one(
          storyQueries.createMessage({
            // creator: jsonld.participant.email, // todo нужно получать ассистент GUID
            publisher: botTable.id,
            version: package_.version,
            experimental: false,
            // todo добавить еще created_at
          }),
        );
        logger.info('story.createContent');
        const contentTable = await transactionConnection.one(
          storyQueries.createContent({
            messageId: messageTable.id,
            content: Buffer.from(decodeURIComponent(jsonld.object.abstract)),
            contentType: jsonld.object.encodingFormat,
            schema: jsonld.object['@type'],
            telegramMessageId: String(jsonld.object.provider.identifier.value),
            date: new Date(jsonld.startTime), // created at

            // todo добавить emailMessageId
            // emailMessageId: content.emailMessageId, // fixme поддержать
          }),
        );
        for (const subject of jsonld.subjectOf) {
          logger.info('story.createAbstract');
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
  return id;
};
/**
 * @param {jsonld} jsonld - parameters
 * @returns {Promise<*>}
 */
module.exports = async function(jsonld) {
  logger.info('text');

  assumeBox(jsonld);
  let id;
  try {
    id = await saveToDatabase(jsonld);
  } catch (error) {
    const document = {
      '@context': 'http://schema.org',
      '@type': 'RejectAction',
      'agent': {
        '@type': 'Person',
        'name': package_.name,
        'url': package_.homepage,
      },
      'object': {
        '@type': 'ExercisePlan',
        'name': 'xxxxxxx',
      },
      'purpose': {
        '@type': 'MedicalCondition',
        'text': 'Save to Database',
      },
    };
    // todo похоже сейчас неверно работает reject, ошибка не поступает в rpc.js
    return Promise.reject(this.error(400, document));
  }
  logger.info('story.commit');

  const document = {
    '@context': 'http://schema.org',
    '@type': 'AcceptAction',
    'agent': {
      '@type': 'Person',
      'name': package_.name,
    },
    'purpose': {
      '@type': 'Answer',
      'abstract': 'Запись добавлена'.toString('base64'),
      'isBasedOn': {
        '@type': 'CreativeWork',
        'name': 'Открыть запись',
        'url': `${SERVER.HOST}/message/${id}`,
        'encodingFormat': 'HTML',
      },
      'encodingFormat': 'text/markdown',
    },
  };

  return Promise.resolve(document);
};
