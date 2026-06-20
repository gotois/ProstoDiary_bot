import { deleteGroup } from '../../models/groups.ts';

export default async (activity, message, bot) => {
  try {
    const botInfo = await bot.getMe();
    if (message.left_chat_member.id !== botInfo.id) {
      return;
    }
  } catch (error) {
    console.error(error);
    return;
  }

  deleteGroup(message.chat.id);
  console.log(`Бот удален из группы ${message.chat.title}`, message);
};
