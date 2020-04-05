const AbstractCommand = require('../models/abstracts/abstract-command');
/**
 * @description Помощь
 * @param {object} parameters - object
 * @returns {Promise<AbstractCommand>}
 */
module.exports = async function (parameters) {
  const abstractCommand = new AbstractCommand({
    ...parameters,
    command: 'Help',
  });
  await abstractCommand.prepare();
  return abstractCommand;
};
