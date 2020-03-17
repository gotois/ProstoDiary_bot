const package_ = require('../../../package.json');
const logger = require('../../services/logger.service');

/**
 * @param {jsonld} jsonld - parameters
 * @param {object} passport - passport gotoisCredentions
 * @returns {Promise<*>}
 */
// eslint-disable-next-line
module.exports = async function(jsonld, { passport }) {
  logger.info('ping');

  const document = {
    '@context': 'http://schema.org',
    '@type': 'AcceptAction',
    'agent': {
      '@type': 'Person',
      'name': package_.name,
    },
    'purpose': {
      '@type': 'Answer',
      'abstract': 'pong',
      'encodingFormat': 'text/plain',
    },
  };

  return Promise.resolve(document);
};
