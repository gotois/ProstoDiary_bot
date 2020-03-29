const AbstractCommand = require('../models/abstracts/abstract-command');
/**
 * @description Проверка ping
 * @param {object} parameters - object
 * @returns {Promise<Abstract>}
 */
module.exports = async function(parameters) {
  const abstractCommand = new AbstractCommand({
    ...parameters,
    command: 'Ping',
  });
  await abstractCommand.prepare();
  return abstractCommand;
};
