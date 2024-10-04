const Dialog = require('../../libs/dialog.cjs');
const { sendErrorMessage } = require('../../libs/tg-messages.cjs');

module.exports = async (bot, message) => {
  const dialog = new Dialog();
  try {
    await dialog.push(message);
    await bot.sendMessage(message.chat.id, dialog.activity.items[0].object[0].content, {
      parse_mode: 'MarkdownV2',
    });
  } catch (error) {
    console.error(error);
    await sendErrorMessage(bot, message, error);
  }
};
