const commands = require('../../core/commands');
/**
 * @todo поддержать еще вариант /help something, где будет происходить поиск по something
 * @returns {jsonrpc}
 */
module.exports = () => {
  const helpData = Object.entries(commands).reduce((acc, [command, object]) => {
    if (object.description.length === 0) {
      return acc;
    }
    acc['/' + command.toLowerCase()] = object.description;
    return acc;
  }, {});
  const message = Object.keys(helpData).reduce((acc, key) => {
    const result = `${key}: ${helpData[key]}\n`;
    acc += result;
    return acc;
  }, '');
  return {
    jsonrpc: '2.0',
    result:
      message +
      '\n\nF.A.Q.: ' +
      'https://prosto-diary.gotointeractive.com/faq/',
  };
};
