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
    // 'Узнай больше подробностей командой /help.' +
    // 'Предоставь свои контакты чтобы продолжить пользоваться сервисом',
  );
}

/**
 * Начало работы
 * @description request_contact может работать только в таком виде
 * @param {object} bot - telegram bot
 * @param {object} message - telegram message
 * @returns {Promise<void>}
 */
module.exports = async (bot, message) => {
  if (!process.env.NODE_ENV?.toLowerCase()?.startsWith('dev')) {
    const users = getUsers(message.from.id);
    if (users.length > 0) {
      return bot.sendMessage(
        message.chat.id,
        'Повторная установка не требуется\n\n' + '/help - помощь' + '\n' + '/licence - соглашение',
      );
    }
  }

  await bot.sendMessage(message.chat.id, getWelcomeText(), {
    parse_mode: 'MarkdownV2',
    disable_notification: true,
    reply_markup: {
      remove_keyboard: true,
      resize_keyboard: true,
      one_time_keyboard: true,
      keyboard: [
        [
          {
            text: 'Принимаю лицензионное соглашение',
            request_contact: true,
          },
        ],
      ],
    },
  });
  // todo - скидывать изображение для лучшего понимания пользователем
  //   bot.sendPhoto(
  //       message.chat.id,
  //       photo,
  //       {
  //         caption: 'kek',
  //       },
  //       parse_mode: 'HTML'
  //       {
  //         filename: 'kek',
  //         contentType: 'image/png',
  //       },
  //     );

  // setTimeout(async () => {
  //   await bot.deleteMessage(message.chat.id, message_id);
  // }, 10000);
};
