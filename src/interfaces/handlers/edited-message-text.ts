// Обрезает input для отображения предыдущего сообщения
const previousInput = (input: string): string => {
  return `${input.replaceAll('\n', ' ').slice(0, 6)}…`;
};

export default async (activity, message, bot) => {
  if (message.text.startsWith('/')) {
    await bot.sendMessage(message.chat.id, 'Редактирование этой записи невозможно', {
      disable_notification: true,
    });
  }
  // ...
  await bot.sendMessage(message.chat.id, `Запись ${previousInput(message.text)} обновлена`, {
    disable_notification: true,
  });
};
