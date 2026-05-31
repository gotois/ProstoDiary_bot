import { refreshTokenGrant } from 'openid-client';
import errorHandler from './error-handler.ts';
import { getClient } from '../libs/oidc-client.ts';
import { setJWT } from '../models/users.ts';

/**
 * @param {Function} callback - callback
 * @returns {(function(*, *): void)}
 */
export default function (callback) {
  return async (activity, message, bot) => {
    if (message.user?.expired_at && message.user.expired_at < Date.now() / 1000) {
      // делаем ротацию ключей для обновления
      if (message.user.refresh_token) {
        try {
          const client = await getClient();
          const tokens = await refreshTokenGrant(client, message.user.refresh_token);
          setJWT(message.user.id, message.user.actor_id, tokens);
        } catch (error) {
          console.error('Ошибка обновления токена:', error);
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
