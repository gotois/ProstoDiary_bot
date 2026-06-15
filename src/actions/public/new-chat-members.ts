export default async (activity, message, bot) => {
  const botInfo = await bot.getMe();
  if (message.new_chat_member.id !== botInfo.id) {
    return;
  }

  const string_ = `Всем привет\\!
Меня зовут ${message.new_chat_member.first_name}\\.
Буду помогать создавать события в ${message.chat.title}\\.`;
  await bot.sendMessage(message.chat.id, string_, {
    parse_mode: 'MarkdownV2',
  });
};
