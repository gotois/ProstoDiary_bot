export default async (activity, message, bot) => {
  console.log('activity', activity);
  await bot.sendMessage(message.chat.id, 'Poll', {
    parse_mode: 'MarkdownV2',
  });
};
