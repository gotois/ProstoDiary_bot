const Dialog = require('../../libs/dialog.cjs');
const { generateCalendar } = require('../../controllers/generate-calendar.cjs');
const { sendPrepareMessage } = require('../../libs/tg-messages.cjs');

module.exports = async (bot, messages, user) => {
  console.log(`Обработка транзакции из ${messages.length} сообщений:`);
  const [message] = messages;
  try {
    const dialog = new Dialog(user);
    for (const message of messages) {
      await sendPrepareMessage(bot, message);
      dialog.push(message);
    }
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
  } catch (error) {
    console.error(error);
    await bot.sendMessage(message.chat.id, '👾', {
      disable_web_page_preview: true,
    });
    await bot.sendMessage(message.chat.id, 'Произошла ошибка: ' + error.message, {
      disable_web_page_preview: true,
    });
  }
};
