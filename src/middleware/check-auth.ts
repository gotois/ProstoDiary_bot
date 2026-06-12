import { refreshTokenGrant, ResponseBodyError } from 'openid-client';
import errorHandler from './error-handler.ts';
import { getClient } from '../libs/oidc-client.ts';
import { clearJWT, setJWT } from '../models/users.ts';

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
          const client = await getClient();
          const tokens = await refreshTokenGrant(client, message.user.refresh_token);
          setJWT(message.user.id, message.user.actor_id, {
            ...tokens,
            expires_in: tokens.expires_in ?? 0,
            id_token: tokens.id_token ?? message.user.id_token,
            refresh_token: tokens.refresh_token ?? message.user.refresh_token,
          });
        } catch (error) {
          console.error('Ошибка обновления токена:', error);
          if (error instanceof ResponseBodyError && error.error === 'invalid_grant') {
            clearJWT(message.user.id);
          }
          return;
        }
      } else {
        /* todo - это старый механизм - с работой отправки контакта - оставить его где-то в другом месте
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

    // todo если использовать inline тогда
    if (message.via_bot) {
      console.log('WIP supports: bot = ' + message.via_bot.is_bot, message.via_bot);
    }

    await errorHandler(callback)(activity, message, bot);
  };
}
