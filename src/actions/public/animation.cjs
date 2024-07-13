const activitystreams = require('telegram-bot-activitystreams');

module.exports = async (bot, message) => {
  const activity = activitystreams(message);
  console.log('animation:', activity);
  await bot.sendMessage(activity.target.id, 'Animation', {
    parse_mode: 'markdown',
  });
};
