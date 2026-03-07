const { SERVER, OIDC } = require('../../environments/index.cjs');

function getWelcomeText() {
  return (
    '**Привет\\! 👋**\n\n' +
    'Я \\- ваш персональный календарный бот, ' +
    'и я здесь, чтобы помочь вам управлять своим временем и задачами\\. ' +
    'Вот что я могу для вас сделать:\\.\n\n' +
    '📅 __Создание и управление событиями__\n\n' +
    '⏰ __Напоминания о важных встречах и делах__\n\n' +
    '🔄 __Синхронизация с другими календарями__\n\n' +
    '📊 __Анализ вашего расписания__\n\n' +
    'Пожалуйста, авторизуйтесь\\.\n\n'
  ).trim();
}

function getInstallAgainText() {
  return 'Установка не требуется\\.\n\nУзнай больше подробностей командой /help\\.'.trim();
}

/**
 * @description Начало работы
 * @param {object} bot - telegram bot
 * @param {object} message - telegram message
 * @returns {Promise<void>}
 */
module.exports = async (bot, message) => {
  if (message.user?.expired_at && message.user.expired_at >= Date.now() / 1000) {
    await bot.sendMessage(message.chat.id, getInstallAgainText(), {
      parse_mode: 'MarkdownV2',
      disable_notification: false,
      reply_to_message_id: message.message_id,
      reply_markup: {
        remove_keyboard: true,
        resize_keyboard: true,
        one_time_keyboard: true,
        keyboard: [],
      },
    });
    return;
  }

  if (message.user && !message.user.timezone) {
    await bot.sendMessage(message.chat.id, 'Требуется определить часовой пояс', {
      parse_mode: 'MarkdownV2',
      disable_notification: true,
      reply_to_message_id: message.message_id,
      reply_markup: {
        remove_keyboard: true,
        resize_keyboard: true,
        one_time_keyboard: true,
        keyboard: [
          [
            {
              text: '📍Определить автоматически',
              request_location: true,
            },
          ],
        ],
      },
    });
    return;
  }

  let webAppUrl = `${OIDC.HOST}/login?lang=${message.from?.language_code}`;
  // eslint-disable-next-line unicorn/consistent-destructuring
  if (SERVER.IS_DEV) {
    webAppUrl += '&debug=1';
  }
  await bot.sendMessage(message.chat.id, getWelcomeText(), {
    parse_mode: 'MarkdownV2',
    disable_notification: true,
    reply_to_message_id: message.message_id,
    reply_markup: {
      remove_keyboard: true,
      resize_keyboard: true,
      one_time_keyboard: true,
      inline_keyboard: [
        [
          {
            text: 'Авторизоваться',
            web_app: {
              url: webAppUrl,
            },
          },
        ],
      ],
    },
  });
};
