const AbstractCommand = require('../models/abstract/abstract-command');
const jsonldAction = require('../models/action/base');
/**
 * @description Проверка ping
 * @param {object} parameters - object
 * @returns {Promise<jsonldAction>}
 */
module.exports = async function (parameters) {
  const abstractCommand = new AbstractCommand({
    ...parameters,
    command: 'Ping',
  });
  await abstractCommand.prepare();
  return abstractCommand.context;
};
