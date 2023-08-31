const activitystreams = require('telegram-bot-activitystreams');

module.exports = (bot, message) => {
  const activity = activitystreams(message);
  console.log(activity);
  // ...
};
