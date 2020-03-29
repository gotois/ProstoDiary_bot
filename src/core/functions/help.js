const AbstractCommand = require('../models/abstracts/abstract-command');
/**
 * @description помощь
 * @param {*} parameters - object
 * @returns {Promise<Abstract>}
 */
module.exports = async function(parameters) {
  const abstractCommand = new AbstractCommand({
    ...parameters,
    command: 'Help',
  });
  await abstractCommand.prepare();
  return abstractCommand;
};
