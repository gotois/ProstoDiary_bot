module.exports = (bot, message) => {
  const activity = activitystreams(message);
  console.log("channel", activity);
  // ...
};