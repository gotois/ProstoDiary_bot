import { setGroup } from '../../models/groups.ts';

const messageText = `Приветствую\\!
Я ваш групповой куратор\\.

Буду помогать создавать события\\.`;

export default async (activity, message, bot) => {
  setGroup({
    id: message.chat.id,
    title: message.chat.title ?? '',
  });

  await bot.sendMessage(message.chat.id, messageText, {
    parse_mode: 'MarkdownV2',
  });
};
