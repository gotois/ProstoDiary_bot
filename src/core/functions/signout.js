const AbstractCommand = require('../models/abstracts/abstract-command');
const { rpc } = require('../../services/request.service');
/**
 * @description блокировки чтения/приема и общей работы бота
 * @returns {Promise<AbstractCommand>}
 */
module.exports = async function ({ auth }) {
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
