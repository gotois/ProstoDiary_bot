const AbstractCommand = require('../models/abstracts/abstract-command');
/**
 * @description Проверка ping
 * @returns {Promise<Abstract>}
 */
module.exports = async function() {
  const abstractCommand = new AbstractCommand({
    command: 'Ping',
  });
  await abstractCommand.prepare();
  return abstractCommand;
};
