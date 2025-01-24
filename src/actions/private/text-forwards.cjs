const Dialog = require('../../libs/dialog.cjs');
const { formatGoogleCalendarUrl, sentToSecretary } = require('../../controllers/generate-calendar.cjs');
const { saveCalendar } = require('../../libs/database.cjs');
const { sendPrepareMessage, sendCalendarMessage } = require('../../libs/tg-messages.cjs');

module.exports = async (bot, messages, user) => {
  console.log(`Обработка транзакции из ${messages.length} сообщений:`);
  const [message] = messages;
  try {
    const dialog = new Dialog();
    for (const message of messages) {
      await sendPrepareMessage(bot, message);
      dialog.push(message);
    }
    const { data, type } = await sentToSecretary({
      id: dialog.uid,
      activity: dialog.activity,
      jwt: user.jwt,
      language: dialog.language,
    });
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
      case 'text/calendar': {
        const googleCalendarUrl = formatGoogleCalendarUrl(data);
        const calendarMessage = await sendCalendarMessage(bot, message, data, googleCalendarUrl.href);
        await saveCalendar(calendarMessage.message_id, user.key, data);
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
