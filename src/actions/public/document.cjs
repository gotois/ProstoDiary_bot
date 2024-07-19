const activitystreams = require('telegram-bot-activitystreams');

module.exports = async (bot, message) => {
  const activity = activitystreams(message);
  console.log('document, activity', activity);
  // todo: отправлять на сервер
  await bot.sendMessage(activity.target.id, 'Document: ' + JSON.stringify(activity.object), {
    parse_mode: 'markdown',
  });
};
