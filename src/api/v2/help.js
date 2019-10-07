const jsonrpc = require('jsonrpc-lite');
const commands = require('../../core/commands');
/**
 * @todo поддержать вариант /help something, где будет происходить поиск по командам. Для этого поддержать новый dialogflow help intent
 * @param {RequestObject} requestObject - requestObject
 * @returns {JsonRpc|JsonRpcError}
 */
module.exports = (requestObject) => {
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
  const message =
    Object.keys(helpData).reduce((accumulator, key) => {
      const result = `${key}: ${helpData[key]}\n`;
      accumulator += result;
      return accumulator;
    }, '') +
    '\n\nF.A.Q.: ' +
    'https://prosto-diary.gotointeractive.com/faq/';
  return jsonrpc.success(requestObject.id, message);
};
