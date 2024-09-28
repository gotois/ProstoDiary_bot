const activitystreams = require('telegram-bot-activitystreams');

/**
 * @param {any} bot - telegram bot
 * @param {any} message - telegram message
 * @returns {Promise<void>}
 */
module.exports = async (bot, message) => {
  const activity = activitystreams(message);
  console.log('contact', activity);
  await bot.sendMessage(message.chat.id, 'Contact: ' + JSON.stringify(activity.object), {
    parse_mode: 'MarkdownV2',
  });
};
