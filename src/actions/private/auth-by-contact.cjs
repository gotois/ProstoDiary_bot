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

  const string_ = `
**Успешно зарегистрированы** ✅

Отправь мне войс, текст или картинку и я добавлю это событие в твой календарь!

Например:
**"💈Напомни завтра о барбершопе в 9:00 на Бауманской"**
**"📆В это воскресенье будет митап"**
**"💧Мне важно пить 2 литра воды в день ежедневно"**
`;
  await bot.sendMessage(activity.target.id, string_, {
    parse_mode: 'markdown',
  });
};
