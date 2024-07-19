const textAction = require('./text.cjs');

module.exports = (bot, message) => {
  console.log('mention', message);
  return textAction(bot, message);
};
