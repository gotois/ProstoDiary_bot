const activitystreams = require('telegram-bot-activitystreams');

module.exports = async (bot, message) => {
  const activity = activitystreams(message);
  console.log('location:', activity);
  await bot.sendMessage(activity.target.id, 'Location: ' + JSON.stringify(activity.object), {
    parse_mode: 'markdown',
  });
};
