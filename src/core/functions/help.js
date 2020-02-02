const package_ = require('../../../package');

/**
 * @description помощь
 * @returns {Promise<jsonld>}
 */
module.exports = () => {
  const document = {
    '@context': 'http://schema.org',
    '@type': 'AllocateAction',
    'agent': {
      '@type': 'Person',
      'name': package_.name,
      'url': package_.homepage,
    },
    'name': 'Help',
  };

  return document;
};
