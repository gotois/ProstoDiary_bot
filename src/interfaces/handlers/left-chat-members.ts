import { container } from '../../app/container.ts';

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

  await container.removeGroup.execute({ groupId: message.chat.id });
  console.log(`Бот удален из группы ${message.chat.title}`, message);
};
