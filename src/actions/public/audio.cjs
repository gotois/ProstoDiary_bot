const activitystreams = require('telegram-bot-activitystreams');

module.exports = async (bot, message) => {
  const activity = activitystreams(message);
  console.log('audio:', activity);
  await bot.sendMessage(activity.target.id, 'Audio', {
    parse_mode: 'markdown',
  });
};
