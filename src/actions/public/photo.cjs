const { generateCalendar } = require('../../controllers/generate-calendar.cjs');
const { sendPrepareMessage } = require('../../libs/tg-messages.cjs');

module.exports = async (bot, message, dialog) => {
  dialog.push(message);
  const me = await bot.getMe();
  dialog.activity.origin = {
    ...dialog.activity.origin,
    name: me.first_name,
    url: 'https://t.me/' + me.username,
  };
  const { data, type } = await generateCalendar(dialog);
  await sendPrepareMessage(bot, message);
  switch (type) {
    case 'text/markdown': {
      await bot.sendMessage(message.chat.id, data, {
        parse_mode: 'MarkdownV2',
        reply_to_message_id: message.message_id,
        protect_content: true,
      });
      break;
    }
    case 'text/plain': {
      await bot.sendMessage(message.chat.id, data, {
        reply_to_message_id: message.message_id,
        protect_content: true,
      });
      break;
    }
    default: {
      throw new Error('Unknown type ' + type);
    }
  }
};
