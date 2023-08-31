const activitystreams = require('telegram-bot-activitystreams');

// Ассистент детектирует пользователя
module.exports = async (bot, message) => {
  const activity = activitystreams(message);
  console.log("activity", activity);

  // ...

  await bot.deleteMessage(message.chat.id, message.message_id);
};
