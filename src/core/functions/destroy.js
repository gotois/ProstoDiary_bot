const AbstractCommand = require('../../models/abstract/abstract-command');
/**
 * @todo дать возможность очищать не все, а только определенные истории
 * @description Удаление всей истории пользователя целиком
 * @returns {Promise<string>}
 */
module.exports = async function() {
  const abstractCommand = new AbstractCommand({
    command: 'Destroy',
  });
  await abstractCommand.prepare();
  return abstractCommand;
};
