/**
 * Начало работы
 * @param bot
 * @param message
 * @returns {Promise<void>}
 */
module.exports = async (bot, message) => {
  console.log('start action');
  const me = await bot.getMe();

  const { message_id } = await bot.sendMessage(
    message.chat.id,
    `Привет **${message.chat.first_name}**!\n` +
    `Я ваш ассистент __${me.first_name}__.\n` +
    'Добавь меня в группу или общайся со мной напрямую.\n' +
    'Продолжая использование вы соглашаетесь с Лицензионным соглашением /licence.\n' +
    'Узнай больше подробностей командой /help.' +
    'Предоставь свои контакты чтобы продолжить пользоваться сервисом',
    {
      disable_notification: true,
      reply_markup: {
        remove_keyboard: true,
        keyboard: [[{ text: 'Agree', request_contact: true }]],
        one_time_keyboard: true,
      },
      parse_mode: 'markdown',
    },
  );
  if (message.passports?.length > 0) {
    const message = 'Повторная установка не требуется\n\n' + '/help - помощь';
    await bot.sendMessage(this.message.chat.id, message);
    return;
  }

  // setTimeout(async () => {
  //   await bot.deleteMessage(message.chat.id, message_id);
  // }, 10000);
};
