const Dialog = require('../../libs/dialog.cjs');

module.exports = async (bot, message) => {
  const dialog = new Dialog();
  await dialog.push(message);
  await bot.sendMessage(message.chat.id, dialog.activity.items[0].object[0].name, {
    parse_mode: 'MarkdownV2',
  });
};
