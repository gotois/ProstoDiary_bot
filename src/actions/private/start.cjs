// Начало работы
module.exports = async (bot, message) => {
  console.log('start action');
  const me = await bot.getMe();

  await bot.sendMessage(
    message.chat.id,
    `Приветствую **${message.chat.first_name}**!\n` +
      `Я ваш ассистент __${me.first_name}__.\n` +
      'Добавь меня в группу или общайся со мной напрямую.\n' +
      'Продолжая использование вы соглашаетесь с Лицензионным соглашением /licence.\n' +
      'Узнай больше подробностей командой /help.',
    {
      reply_markup: {
        remove_keyboard: true,
      },
      parse_mode: 'markdown',
    },
  );
  console.log(message)
  if (message.passports?.length > 0) {
    const message = 'Повторная установка не требуется\n\n' + '/help - помощь';
    await bot.sendMessage(this.message.chat.id, message);
    return;
  }

  const { message_id } = await bot.sendMessage(message.chat.id, 'Предоставьте свои контакты', {
    parse_mode: 'markdown',
    disable_notification: true,
    reply_markup: {
      keyboard: [[{ text: 'Agree', request_contact: true }]],
      one_time_keyboard: true,
    },
  });
  setTimeout(async () => {
    await bot.deleteMessage(message.chat.id, message_id);
  }, 10000);
};
