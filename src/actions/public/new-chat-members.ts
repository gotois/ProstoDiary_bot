export default async (activity, message, bot) => {
  console.log('action', message);
  const string_ = `Всем привет\\!
Меня зовут ${message.new_chat_member.first_name}\\.
Буду помогать создавать события в ${message.chat.title}\\.`;
  await bot.sendMessage(message.chat.id, string_, {
    parse_mode: 'MarkdownV2',
  });
};
