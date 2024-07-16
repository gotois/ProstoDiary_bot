const activitystreams = require('telegram-bot-activitystreams');

// eslint-disable-next-line
module.exports = async (bot, message) => {
  const activity = activitystreams(message);
  console.log('video, activity', activity);
};
