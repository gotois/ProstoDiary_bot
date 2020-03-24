const AbstractCommand = require('../../models/abstract/abstract-command');
const rpc = require('../lib/rpc');
/**
 * @description блокировки чтения/приема и общей работы бота
 * @returns {Promise<jsonld>}
 */
module.exports = async function({ auth }) {
  const abstractCommand = new AbstractCommand({
    command: 'SignOut',
  });
  await abstractCommand.prepare();
  const jsonldMessage = await rpc({
    body: {
      jsonrpc: '2.0',
      method: 'signout',
      id: 1,
      params: abstractCommand.context,
    },
    auth: auth,
  });

  return jsonldMessage;
};
