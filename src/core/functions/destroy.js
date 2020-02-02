const package_ = require('../../../package');

/**
 * @todo дать возможность очищать не все, а только определенные истории
 * @description Удаление всей истории пользователя целиком
 * @returns {Promise<string>}
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
    'name': 'Destroy',
  };

  return document;
};
