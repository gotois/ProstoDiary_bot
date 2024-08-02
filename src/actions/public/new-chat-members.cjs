module.exports = async (bot, message) => {
  console.log('action', message);
  if (message.new_chat_member) {
    const string_ = `Всем привет! Меня зовут ${message.new_chat_member.first_name}`;
    await bot.sendMessage(message.chat.id, string_, {
      parse_mode: 'markdown',
    });
  }
};
