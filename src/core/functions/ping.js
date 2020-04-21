const AbstractCommand = require('../models/abstract/abstract-command');
/**
 * @description Проверка ping
 * @param {object} parameters - object
 * @returns {Promise<jsonldApiRequest>}
 */
module.exports = async function (parameters) {
  const abstractCommand = new AbstractCommand({
    ...parameters,
    command: 'Ping',
  });
  await abstractCommand.prepare();
  return abstractCommand.context;
};
