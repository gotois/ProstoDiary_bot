import textAction from './text.mjs';

export default (bot, message) => {
  console.log('mention', message);
  return textAction(bot, message);
};
