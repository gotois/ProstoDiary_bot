const activitystreams = require('telegram-bot-activitystreams');

module.exports = async (bot, message) => {
  const activity = activitystreams(message);
  console.log('sticker:', activity);
  await bot.sendMessage(activity.target.id, 'Sticker: ' + activity.object[0].content, {
    parse_mode: 'markdown',
  });
};
