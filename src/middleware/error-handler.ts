import { container } from '../app/container.ts';

/**
 * @description Оборачивает обработчик бота общим error handler.
 * @param callback - обработчик сообщения Telegram.
 * @returns Обработчик с перехватом ошибок.
 */
export default function (callback: (...arguments_: unknown[]) => Promise<unknown>) {
  return async (activity, message, bot) => {
    try {
      await callback(activity, message, bot);
    } catch (error) {
      console.error(error);
      if (!message.chat) {
        return;
      }
      switch (error?.message) {
        case 'fetch failed': {
          await bot.setMessageReaction(message.chat.id, message.message_id, {
            reaction: JSON.stringify([
              {
                type: 'emoji',
                emoji: '👾',
              },
            ]),
          });
          return bot.sendMessage(message.chat.id, 'Произошла ошибка при обращении к серверу');
        }
        case 'Unauthorized': {
          await container.user.deleteUser({ telegramId: message.chat.id });
          await bot.setMessageReaction(message.chat.id, message.message_id, {
            reaction: JSON.stringify([
              {
                type: 'emoji',
                emoji: '🤷‍♀',
              },
            ]),
          });
          return bot.sendMessage(message.chat.id, 'Требуется авторизация /start', {
            disable_web_page_preview: true,
          });
        }
        case 'Bad Request': {
          await bot.setMessageReaction(message.chat.id, message.message_id, {
            reaction: JSON.stringify([
              {
                type: 'emoji',
                emoji: '👾',
              },
            ]),
          });
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
}
