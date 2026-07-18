import errorHandler from './error-handler.ts';
import { container } from '../app/container.ts';
import { AuthorizationRequiredError } from '../infrastructure/auth/user-authorization.ts';

/**
 * Middleware проверки авторизации пользователя с автообновлением токена
 * @param {Function} callback - обработчик действия бота
 * @returns {Function} Обёрнутый обработчик с проверкой токена
 */
export default function (callback: (...arguments_: unknown[]) => Promise<void>) {
  return async (activity, message, bot) => {
    if (message.user?.id) {
      try {
        const authorization = await container.authorization.ensureById(message.user.id);
        message.user.access_token = authorization.user.accessToken;
        message.user.id_token = authorization.user.idToken;
        message.user.refresh_token = authorization.user.refreshToken;
        message.user.expired_at = authorization.user.expiredAt;
      } catch (error) {
        if (!(error instanceof AuthorizationRequiredError)) {
          console.error('Ошибка обновления токена:', error);
        }
        console.warn('todo - это старый механизм - с работой отправки контакта - оставить его где-то в другом месте');
        /*
        await bot.sendMessage(message.chat.id, 'Предоставьте свой номер телефона', {
          reply_markup: {
            remove_keyboard: true,
            resize_keyboard: true,
            one_time_keyboard: true,
            keyboard: [
              [
                {
                  text: '📞 Отправить контакт',
                  request_contact: true,
                },
              ],
            ],
          },
        });
        /**/
        return;
      }
    }

    await errorHandler(callback)(activity, message, bot);
  };
}
