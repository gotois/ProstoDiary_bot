const package_ = require('../../../package');

/**
 * @description backup
 * @param {object} requestObject - requestObject
 * @returns {Promise<jsonld>}
 */
module.exports = (requestObject) => {
  const { date, token, sorting = 'Ascending' } = requestObject;

  const document = {
    '@context': 'http://schema.org',
    '@type': 'AllocateAction',
    'agent': {
      '@type': 'Person',
      'name': package_.name,
      'url': package_.homepage,
    },
    'name': 'Backup',
    'startTime': date,
    'subjectOf': [
      {
        '@type': 'CreativeWork',
        'name': 'token',
        'abstract': token,
        'encodingFormat': 'text/plain',
        // еще может потребоваться поле dateCreated - которое будет детектировать когда этот токен пришел чтобы его лучше детектить
      },
      {
        '@type': 'CreativeWork',
        'name': 'sorting',
        'abstract': sorting,
        'encodingFormat': 'text/plain',
      },
    ],
  };

  return document;
};
