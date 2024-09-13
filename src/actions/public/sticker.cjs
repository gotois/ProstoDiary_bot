const Dialog = require('../../libs/dialog.cjs');

module.exports = async (bot, message) => {
  const dialog = new Dialog();
  try {
    await dialog.push(message);
    await bot.sendMessage(message.chat.id, dialog.activity.items[0].object[0].content, {
      parse_mode: 'markdown',
    });
  } catch (error) {
    console.error(error);
    await bot.setMessageReaction(message.chat.id, message.message_id, {
      reaction: JSON.stringify([
        {
          type: 'emoji',
          emoji: '🤷‍♀',
        },
      ]),
    });
    return bot.sendMessage(message.chat.id, error.message, {
      parse_mode: 'markdown',
      disable_web_page_preview: true,
    });
  }
};
