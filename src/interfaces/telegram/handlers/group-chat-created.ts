import { container } from '../../../app/container.ts';

const messageText = String.raw`Приветствую\!
Я ваш групповой куратор\.

Буду помогать создавать события\.`;

export default async (activity, message, bot) => {
  await container.registerGroup.execute({
    id: message.chat.id,
    title: message.chat.title ?? '',
  });

  await bot.sendMessage(message.chat.id, messageText, {
    parse_mode: 'MarkdownV2',
  });
};
