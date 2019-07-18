const commands = require('../../commands');
/**
 * @todo поддержать еще вариант /help something, где будет происходить поиск по something
 * @returns {string}
 */
module.exports = () => {
  const helpData = Object.entries(commands).map(([command, object]) => {
    return {
      ['/' + command]: object.description,
    };
  });
  const message = Object.keys(helpData).reduce((acc, key) => {
    acc += `\n${key}: ${helpData[key]}`;
    return acc;
  }, '');
  return message;
};
