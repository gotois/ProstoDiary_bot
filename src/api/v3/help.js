const pkg = require('../../../package');
const { getCheckSum } = require('../../services/version.service');
const { IS_PRODUCTION } = require('../../environment');
const { commands } = require('../../controllers/telegram');
/**
 * @returns {SuccessObject}
 * @param _params
 * @param _parameters
 * @param xxx
 */
module.exports = (_parameters, xxx) => {
  const { user } = xxx;
  console.log(xxx);
  console.log(_parameters);

  const helpData = Object.entries(commands).reduce(
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
