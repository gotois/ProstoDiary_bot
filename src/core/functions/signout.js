const package_ = require('../../../package.json');
const rpc = require('../lib/rpc');

/**
 * @description блокировки чтения/приема и общей работы бота
 * @returns {Promise<jsonld>}
 */
module.exports = async function({ auth }) {
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

  const jsonldMessage = await rpc({
    body: {
      jsonrpc: '2.0',
      method: 'signout',
      id: 1,
      params: document,
    },
    auth: auth,
  });

  return jsonldMessage;
};
