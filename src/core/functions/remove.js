const package_ = require('../../../package.json');
/**
 * @todo добавить враппер
 * @description Удаление записи
 * @param {object} requestObject - requestObject
 * @returns {Promise<jsonldAction>}
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
