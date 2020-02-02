const package_ = require('../../../package');

/**
 * @description блокировки чтения/приема и общей работы бота
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
    'name': 'SignOut',
  };

  return document;
};
