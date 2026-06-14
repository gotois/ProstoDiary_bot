const messageText = `Приветствую\\!
Я ваш групповой куратор\\.

Буду помогать создавать события\\.`;

export default async (activity, message, bot) => {
  await bot.sendMessage(
    message.chat.id,
    messageText,
    {
      parse_mode: 'MarkdownV2',
    },
  );
};
