const AbstractCommand = require('../models/abstract/abstract-command');
/**
 * @todo дать возможность очищать не все, а только определенные истории
 * @description Удаление всей истории пользователя целиком
 * @param {object} requestObject - requestObject
 * @returns {Promise<object>}
 */
module.exports = async function (requestObject) {
  const abstractCommand = new AbstractCommand({
    ...requestObject,
    command: 'Destroy',
  });
  await abstractCommand.prepare();
  return abstractCommand.context;
};
