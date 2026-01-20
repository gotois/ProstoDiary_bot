const { setNewUser, hasUser, getUsers } = require('../../models/users.cjs');

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
    'Продолжая использование вы соглашаетесь с Лицензионным соглашением /licence\\.\n\n' +
    'Введите ваш город на английском\\:'
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
  if (hasUser(message.chat.id)) {
    const [user] = getUsers(message.chat.id);
    if (!user.location) {
      await bot.sendMessage(message.chat.id, 'Введите свой город на английском языке:', {
        reply_to_message_id: message.message_id,
        reply_markup: {
          force_reply: true,
        },
      });
      return;
    }
    if (!user.jwt) {
      console.warn('JWT не установлен');
      return;
    }

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
  } else {
    await setNewUser(message.chat.id);
    await bot.sendMessage(message.chat.id, getWelcomeText(), {
      parse_mode: 'MarkdownV2',
      disable_notification: false,
      reply_to_message_id: message.message_id,
      reply_markup: {
        remove_keyboard: true,
        resize_keyboard: true,
        one_time_keyboard: true,
        keyboard: [
          [
            {
              text: '📍Определи мой часовой пояс или введи свой город на английском',
              request_location: true,
            },
          ],
        ],
      },
    });
  }
};
