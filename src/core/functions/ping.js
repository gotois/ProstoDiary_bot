const package_ = require('../../../package');

/**
 * @description Проверка ping
 * @returns {Promise<jsonld>}
 */
module.exports = () => {
  const document = {
    '@context': {
      schema: 'http://schema.org/',
      agent: 'schema:agent',
      name: 'schema:name',
    },
    '@type': 'AllocateAction',
    'agent': {
      '@type': 'Person',
      'name': package_.name,
    },
    'name': 'Ping',
  };

  return document;
};
