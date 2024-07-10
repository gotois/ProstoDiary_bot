/**
 * Начало работы
 * @param {object} bot
 * @param {object} message
 * @returns {Promise<void>}
 */
module.exports = async (bot, message) => {
  const { message_id } = await bot.sendMessage(
    message.chat.id,
    '**Привет! 👋**\n\n' +
      'Я - __ваш персональный календарный бот__, и я здесь, чтобы помочь вам управлять своим временем и задачами. Вот что я могу для вас сделать:.\n\n' +
      '📅 Создание и управление событиями\n\n' +
      '⏰ Напоминания о важных встречах и делах\n\n' +
      '🔄 Синхронизация с другими календарями\n\n' +
      '📊 Анализ вашего расписания\n\n' +
      'Чтобы начать, просто напишите команду',
    // 'Продолжая использование вы соглашаетесь с Лицензионным соглашением /licence.\n' +
    // 'Узнай больше подробностей командой /help.' +
    // 'Предоставь свои контакты чтобы продолжить пользоваться сервисом',
    {
      disable_notification: true,
      reply_markup: {
        remove_keyboard: false,
        keyboard: [[{ text: 'Agree', request_contact: true }]],
        one_time_keyboard: true,
      },
      parse_mode: 'markdown',
    },
  );
  if (message.passports?.length > 0) {
    const message = 'Повторная установка не требуется\n\n' + '/help - помощь';
    return bot.sendMessage(this.message.chat.id, message);
  }

  // setTimeout(async () => {
  //   await bot.deleteMessage(message.chat.id, message_id);
  // }, 10000);
};
