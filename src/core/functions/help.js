const AbstractCommand = require('../models/abstract/abstract-command');
/**
 * @description Помощь
 * @param {object} parameters - object
 * @returns {Promise<object>}
 */
module.exports = async function (parameters) {
  const abstractCommand = new AbstractCommand({
    ...parameters,
    command: 'Help',
  });
  await abstractCommand.prepare();
  return abstractCommand.context;
};
