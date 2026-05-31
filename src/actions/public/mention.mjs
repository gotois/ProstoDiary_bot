import textAction from './text.mjs';

export default (activity, message, bot) => {
  console.log('mention', message);
  return textAction(activity, message, bot);
};
