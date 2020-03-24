const AbstractCommand = require('../../models/abstract/abstract-command');
const rpc = require('../lib/rpc');
/**
 * @todo дать возможность очищать не все, а только определенные истории
 * @description Удаление всей истории пользователя целиком
 * @returns {Promise<string>}
 */
module.exports = async function({ auth, jwt }) {
  const abstractCommand = new AbstractCommand({
    command: 'Destroy',
  });
  await abstractCommand.prepare();
  const jsonldMessage = await rpc({
    body: {
      jsonrpc: '2.0',
      method: 'signout',
      id: 1,
      params: abstractCommand.context,
    },
    auth,
    jwt,
  });

  return jsonldMessage;
};
