const { refreshTokenGrant } = require('openid-client');
const errorHandler = require('./error-handler.cjs');
const getClient = require('../oidc-client.cjs');
const { setJWT } = require('../models/users.cjs');

/**
 * @param {Function} callback - callback
 * @returns {(function(*, *): void)}
 */
module.exports = function (callback) {
  return async (bot, message) => {
    if (message.user?.expired_at && message.user.expired_at < Date.now() / 1000) {
      // делаем ротацию ключей для обновления
      if (message.user.refresh_token) {
        try {
          const client = await getClient();
          const tokens = await refreshTokenGrant(client, message.user.refresh_token);
          setJWT(message.user.id, tokens);
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

    await errorHandler(callback)(bot, message);
  };
};
