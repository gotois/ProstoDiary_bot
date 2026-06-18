import { deleteGroup } from '../../models/groups.ts';

export default async (activity, message, bot) => {
  console.log(`left chat ${message.chat.title}`, message);

  const botInfo = await bot.getMe();
  if (message.left_chat_member.id !== botInfo.id) {
    return;
  }

  deleteGroup(message.chat.id);
};
