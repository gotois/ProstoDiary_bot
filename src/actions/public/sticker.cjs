module.exports = async (bot, message) => {
  await bot.sendMessage(message.chat.id, message.activity.items[0].object[0].content, {
    parse_mode: 'MarkdownV2',
  });
};
