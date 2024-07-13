const activitystreams = require('telegram-bot-activitystreams');

module.exports = async (bot, message) => {
  const activity = activitystreams(message);
  console.log('location', activity);
  await bot.sendMessage(activity.target.id, 'Poll', {
    parse_mode: 'markdown',
  });
};
