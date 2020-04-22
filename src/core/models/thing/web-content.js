const ogParser = require('../../../lib/og-parser');
const logger = require('../../../lib/log');

module.exports = async ({ url, namespace, creator, publisher }) => {
  logger.info('webpage preparing');
  const { title, name, encodingFormat } = await ogParser(url);
  return {
    '@type': 'WebContent',
    '@context': {
      schema: 'http://schema.org/',
      creator: 'schema:creator',
      publisher: 'schema:publisher',
      namespace: 'schema:namespace',
      encodingFormat: 'schema:encodingFormat',
      url: 'schema:url',
      name: 'schema:name',
      alternativeHeadline: 'schema:alternativeHeadline',
    },
    'namespace': namespace,
    'creator': creator,
    'publisher': publisher,
    'alternativeHeadline': title,
    'name': name,
    'encodingFormat': encodingFormat,
    'url': url,
  };
};
