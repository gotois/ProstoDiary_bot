const activitystreams = require('telegram-bot-activitystreams');

/**
 * @description Ассистент детектирует пользователя
 * @param {any} bot - telegram bot
 * @param {any} message - telegram message
 * @returns {Promise<void>}
 */
module.exports = async (bot, message) => {
  const activity = activitystreams(message);
  console.log('activity', activity);

  await bot.deleteMessage(activity.target.id, message.message_id);
};
