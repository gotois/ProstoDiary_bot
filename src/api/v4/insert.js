const winston = require('winston');
const { SERVER } = require('../../environment');
const package_ = require('../../../package');
const logger = require('../../services/logger.service');
const PsqlTransport = require('../../db/transports/psql-transport');
// const linkedDataSignature = require('../../services/linked-data-signature.service');

const pqsqlTransport = new PsqlTransport();
const storyLogger = winston.createLogger({
  transports: [pqsqlTransport],
});

// здесь данные о принятии решений: производить запись или нет
// eslint-disable-next-line
const assumeBox = (jsonld) => {
  return void 0;
};

/**
 * @param {jsonld} jsonld - parameters
 * @returns {Promise<*>}
 */
module.exports = function(jsonld) {
  return new Promise((resolve, reject) => {
    logger.info('saveToDatabase');
    assumeBox(jsonld);
    pqsqlTransport.on('logged', (info) => {
      const id = info.message.id;
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
      return resolve(document);
    });
    pqsqlTransport.on('error', (/*error*/) => {
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
      return reject(this.error(400, document));
    });
    storyLogger.info(jsonld);
  });
};
