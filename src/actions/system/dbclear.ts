import { deleteUser } from '../../models/users.ts';

/** Очистить базу данных с подтверждением — удаление всей истории пользователя */
export default async (activity, message, bot) => {
  const { message_id } = await bot.sendMessage(message.chat.id, 'Очистить ваши записи?\nНапишите: YES', {
    reply_markup: {
      force_reply: true,
    },
  });
  bot.onReplyToMessage(message.chat.id, message_id, async ({ text }) => {
    if (text !== 'YES') {
      await bot.sendMessage(message.chat.id, 'Операция отменена пользователем', {
        reply_markup: {
          remove_keyboard: true,
          selective: false,
        },
      });
      return;
    }

    deleteUser(message.user.id);
    await bot.sendMessage(message.chat.id, 'Ваша история была удалена');
  });
};
