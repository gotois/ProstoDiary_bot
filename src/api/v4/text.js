const package_ = require('../../../package');
const logger = require('../../services/logger.service');
// const linkedDataSignature = require('../../services/linked-data-signature.service');
// const Story = require('../../models/story');

/**
 * @param {jsonld} jsonld - parameters
 * @param {object} passport - passport gotoisCredentions
 * @returns {Promise<*>}
 */
// eslint-disable-next-line
module.exports = async function(jsonld, { passport }) {
  logger.info('text');

  // fixme надо сохранять jsonld в БД!

  // todo: поддержать новый функционал jsonld
  // const story = new Story(jsonld);
  // const id = await story.commit();

  // todo линки запихнуть в schema.org
  // links.push({
  //   text: 'show message',
  //   url: `${SERVER.HOST}:${SERVER.PORT}/message/${id}`,
  // });

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
      'encodingFormat': 'text/markdown', // todo или даже в html
    },
  };

  return Promise.resolve(document);
};
