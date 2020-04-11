const AbstractCommand = require('../models/abstracts/abstract-command');
/**
 * @todo дать возможность очищать не все, а только определенные истории
 * @description Удаление всей истории пользователя целиком
 * @param {object} requestObject - requestObject
 * @returns {Promise<AbstractCommand>}
 */
module.exports = async function (requestObject) {
  const abstractCommand = new AbstractCommand({
    ...requestObject,
    command: 'Destroy',
  });
  await abstractCommand.prepare();
  return abstractCommand;
};
