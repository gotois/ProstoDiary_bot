import { ResponseBodyError } from 'openid-client';
import errorHandler from './error-handler.ts';
import { container } from '../app/container.ts';
import { toUserTokenInput } from '../infrastructure/auth/user-token-input.ts';

/**
 * Middleware проверки авторизации пользователя с автообновлением токена
 * @param {Function} callback - обработчик действия бота
 * @returns {Function} Обёрнутый обработчик с проверкой токена
 */
export default function (callback: (...arguments_: unknown[]) => Promise<void>) {
  return async (activity, message, bot) => {
    if (message.user?.expired_at && message.user.expired_at <= Date.now() / 1000 + 60) {
      // делаем ротацию ключей для обновления
      if (message.user.refresh_token) {
        try {
          const tokens = await container.refreshUserTokens.execute({ refreshToken: message.user.refresh_token });
          await container.saveUserTokens.execute(
            toUserTokenInput({
              telegramId: message.user.id,
              actorId: message.user.actor_id,
              tokens: {
                access_token: tokens.accessToken,
                id_token: tokens.idToken ?? message.user.id_token,
                refresh_token: tokens.refreshToken ?? message.user.refresh_token,
              },
            }),
          );
        } catch (error) {
          console.error('Ошибка обновления токена:', error);
          if (error instanceof ResponseBodyError && error.error === 'invalid_grant') {
            await container.clearUserTokens.execute({ telegramId: message.user.id });
          }
          return;
        }
      } else {
        console.warn('todo - это старый механизм - с работой отправки контакта - оставить его где-то в другом месте')
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
