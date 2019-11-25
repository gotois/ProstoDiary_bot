const pkg = require('../../../package');
const { getCheckSum } = require('../../services/version.service');
const { IS_PRODUCTION } = require('../../environment');
const { telegram } = require('../../controllers');
/**
 * @param {object} parameters - xxx p
 * @returns {SuccessObject}
 */
module.exports = (parameters) => {
  const { user } = parameters;
  console.log(parameters);

  const helpData = Object.entries(telegram).reduce(
    (accumulator, [command, object]) => {
      if (object.description.length === 0) {
        return accumulator;
      }
      accumulator['/' + command.toLowerCase()] = object.description;
      return accumulator;
    },
    {},
  );
  let message =
    Object.keys(helpData).reduce((accumulator, key) => {
      const result = `${key}: ${helpData[key]}\n`;
      accumulator += result;
      return accumulator;
    }, '') +
    '\n\nF.A.Q.: ' +
    'https://prosto-diary.gotointeractive.com/faq/';
  message += pkg.version;
  if (IS_PRODUCTION) {
    message += ' - production\n';
  }
  message += ' \n' + getCheckSum();
  return Promise.resolve(message);
};
