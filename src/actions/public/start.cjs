const { setNewUser, hasUser, getUsers } = require('../../models/users.cjs');

function getWelcomeText() {
  return (
    '**Привет\\! 👋**\n\n' +
    'Я \\- __ваш персональный календарный бот__, ' +
    'и я здесь, чтобы помочь вам управлять своим временем и задачами\\. ' +
    'Вот что я могу для вас сделать:\\.\n\n' +
    '📅 Создание и управление событиями\n\n' +
    '⏰ Напоминания о важных встречах и делах\n\n' +
    '🔄 Синхронизация с другими календарями\n\n' +
    '📊 Анализ вашего расписания\n\n' +
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
    if (!user.timezone) {
      console.warn('timezone не установлен');
    }
    if (!user.jwt) {
      console.warn('JWT не установлен');
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
