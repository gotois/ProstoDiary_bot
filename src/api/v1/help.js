const commands = require('../../core/commands');
/**
 * @todo поддержать вариант /help something, где будет происходить поиск по командам
 * @returns {jsonrpc}
 */
module.exports = () => {
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
  const message = Object.keys(helpData).reduce((accumulator, key) => {
    const result = `${key}: ${helpData[key]}\n`;
    accumulator += result;
    return accumulator;
  }, '');
  return {
    jsonrpc: '2.0',
    result:
      message +
      '\n\nF.A.Q.: ' +
      'https://prosto-diary.gotointeractive.com/faq/',
  };
};
