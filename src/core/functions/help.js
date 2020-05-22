const AbstractCommand = require('../models/abstract/abstract-command');
const jsonldAction = require('../models/action/base');
/**
 * @description Помощь
 * @param {object} parameters - object
 * @returns {Promise<jsonldAction>}
 */
module.exports = async function (parameters) {
  const abstractCommand = new AbstractCommand({
    ...parameters,
    command: 'Help',
  });
  await abstractCommand.prepare();
  return abstractCommand.context;
};
