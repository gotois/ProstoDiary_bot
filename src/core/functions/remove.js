const package_ = require('../../../package');

/**
 * Удаление записи
 *
 * @param {object} requestObject - requestObject
 * @returns {Promise<jsold>}
 */
module.exports = (requestObject) => {
  const { id } = requestObject;
  const document = {
    '@context': 'http://schema.org',
    '@type': 'AllocateAction',
    'agent': {
      '@type': 'Person',
      'name': package_.name,
      'url': package_.homepage,
    },
    'name': 'RemoveMessage',
    'subjectOf': [
      {
        '@type': 'CreativeWork',
        'name': 'id',
        'abstract': id,
        'encodingFormat': 'text/plain',
      },
    ],
  };

  return document;
};
