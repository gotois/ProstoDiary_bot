const activitystreams = require('telegram-bot-activitystreams');

module.exports = async (bot, message) => {
  console.log("message", message);
  const activity = activitystreams(message);
  console.log("activity:", activity);
  console.log(activity.object[0].content);
};
