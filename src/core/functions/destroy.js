const AbstractCommand = require('../models/abstracts/abstract-command');
/**
 * @todo дать возможность очищать не все, а только определенные истории
 * @description Удаление всей истории пользователя целиком
 * @returns {Promise<Abstract>}
 */
module.exports = async function () {
  const abstractCommand = new AbstractCommand({
    command: 'Destroy',
  });
  await abstractCommand.prepare();
  return abstractCommand;
};
