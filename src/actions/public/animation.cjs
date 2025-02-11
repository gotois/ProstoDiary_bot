module.exports = async (bot, message, dialog) => {
  dialog.push(message);
  await bot.sendMessage(message.chat.id, dialog.activity.items[0].object[0].name, {
    parse_mode: 'MarkdownV2',
  });
};
