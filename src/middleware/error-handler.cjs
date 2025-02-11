/**
 * @description Обработчик ошибок
 * @param {Function} callback - callback
 * @returns {Promise<*>}
 */
module.exports = function (callback) {
  return async (bot, message, dialog) => {
    try {
      await callback(bot, message, dialog);
    } catch (error) {
      console.error(error);
      if (!message.chat) {
        return;
      }
      if (!message.id) {
        await bot.setMessageReaction(message.chat.id, message.message_id, {
          reaction: JSON.stringify([
            {
              type: 'emoji',
              emoji: '👾', //  🤷‍♀
            },
          ]),
        });
      }
      switch (error?.message) {
        case 'fetch failed': {
          return bot.sendMessage(message.chat.id, 'Произошла ошибка при обращении к серверу');
        }
        case 'Unauthorized': {
          return bot.sendMessage(message.chat.id, 'Требуется авторизация /start', {
            disable_web_page_preview: true,
          });
        }
        case 'Bad Request': {
          return bot.sendMessage(
            message.chat.id,
            'Произошла ошибка на сервере. Пожалуйста попробуйте попозже, уточните дату и время.',
            {
              disable_web_page_preview: true,
            },
          );
        }
        default: {
          return bot.sendMessage(message.chat.id, error?.message ?? 'Произошла ошибка', {
            message_effect_id: '5046589136895476101', // 💩
            disable_web_page_preview: true,
          });
        }
      }
    }
  };
};
