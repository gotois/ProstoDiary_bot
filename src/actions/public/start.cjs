const { getUsers } = require('../../libs/database.cjs');

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
    'Продолжая использование вы соглашаетесь с Лицензионным соглашением /licence\\.\n'
  ).trim();
}

function getInstallAgainText() {
  return (
    '**Требуется повторная установка**\n\n' +
    'Предоставь свои контакты заново, чтобы продолжить пользоваться сервисом\\.\n\n' +
    'Узнай больше подробностей командой /help\\.\n' +
    'Продолжая использование вы соглашаетесь с Лицензионным соглашением /licence\\.\n'
  ).trim();
}

/**
 * @description Начало работы
 * @param {object} bot - telegram bot
 * @param {object} message - telegram message
 * @returns {Promise<void>}
 */
module.exports = async (bot, message) => {
  const existUser = getUsers(message.chat.id)?.length > 0;
  await bot.sendMessage(message.chat.id, existUser ? getInstallAgainText() : getWelcomeText(), {
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
            text: '📍Определи мой часовой пояс',
            request_location: true,
          },
        ],
      ],
    },
  });
};
