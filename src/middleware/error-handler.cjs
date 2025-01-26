module.exports = function (callback) {
  return async (bot, message, user) => {
    try {
      await callback(bot, message, user);
    } catch (error) {
      await bot.setMessageReaction(message.chat.id, message.message_id, {
        reaction: JSON.stringify([
          {
            type: 'emoji',
            emoji: '🤷‍♀', // 👾
          },
        ]),
      });
      switch (error?.message) {
        case 'Unauthorized': {
          return bot.sendMessage(message.chat.id, 'Требуется авторизация /start', {
            disable_web_page_preview: true,
          });
        }
        case 'Bad Request': {
          return bot.sendMessage(
            message.chat.id,
            'Пожалуйста, уточните дату и время. Даты которые уже прошли не могут быть созданы.',
            {
              disable_web_page_preview: true,
            },
          );
        }
        default: {
          return bot.sendMessage(message.chat.id, 'Произошла ошибка: ' + error, {
            disable_web_page_preview: true,
          });
        }
      }
    }
  };
};
