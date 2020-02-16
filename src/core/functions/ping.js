const package_ = require('../../../package');
const rpc = require('../lib/rpc');
/**
 * @description Проверка ping
 * @returns {Promise<string>}
 */
module.exports = async function({ auth, jwt }) {
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

  const jsonldMessage = await rpc({
    body: {
      jsonrpc: '2.0',
      method: 'ping',
      id: 1,
      params: document,
    },
    jwt,
    auth,
  });
  return jsonldMessage;
};
