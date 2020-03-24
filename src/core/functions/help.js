const AbstractCommand = require('../../models/abstract/abstract-command');
const rpc = require('../lib/rpc');
/**
 * @description помощь
 * @returns {Promise<jsonld>}
 */
module.exports = async function({ auth, jwt }) {
  const abstractCommand = new AbstractCommand({
    command: 'Help',
  });
  await abstractCommand.prepare();
  const jsonldMessage = await rpc({
    body: {
      jsonrpc: '2.0',
      method: 'help',
      id: 1,
      params: abstractCommand.context,
    },
    jwt,
    auth,
  });
  return jsonldMessage;
};
