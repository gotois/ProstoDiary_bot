module.exports = async (activity, message, bot) => {
  console.log('location', activity);
  await bot.sendMessage(message.chat.id, 'Poll', {
    parse_mode: 'MarkdownV2',
  });
};
