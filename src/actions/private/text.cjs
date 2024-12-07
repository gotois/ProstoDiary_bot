const Dialog = require('../../libs/dialog.cjs');
const {
  generateCalendar,
  formatCalendarMessage,
  formatGoogleCalendarUrl,
  sentToSecretary,
} = require('../../controllers/generate-calendar.cjs');
const { saveCalendar } = require('../../libs/database.cjs');
const { serializeMarkdownV2 } = require('../../libs/md-serialize.cjs');
const { notify } = require('../../libs/execute-time.cjs');
const {
  sendPrepareCalendar,
  sendCalendarMessage,
  sendTaskMessage,
  sendErrorMessage,
} = require('../../libs/tg-messages.cjs');

module.exports = async (bot, message, user) => {
  const dialog = new Dialog();
  try {
    if (message.text.length < 5) {
      throw new Error('Непонятно');
    }
    await dialog.push(message);
    const { data, type } = await sentToSecretary({
      id: dialog.uid,
      activity: dialog.activity,
      jwt: user.jwt,
      language: dialog.language,
    });
    switch (type) {
      case 'text/markdown': {
        await bot.sendMessage(message.chat.id, serializeMarkdownV2(data), {
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
        await sendPrepareCalendar(bot, message);
        const ical = await generateCalendar({
          id: dialog.uid,
          activity: dialog.activity,
          jwt: user.jwt,
          language: dialog.language,
        });
        const output = formatCalendarMessage(ical, dialog.language);
        const googleCalendarUrl = formatGoogleCalendarUrl(ical);
        const calendarMessage = await sendCalendarMessage(bot, message, output, googleCalendarUrl.href);
        await saveCalendar(calendarMessage.message_id, user.key, ical);
        const { text, url } = await notify(ical);
        await sendTaskMessage(bot, calendarMessage, text, url);
        break;
      }
      default: {
        console.error('Unknown type:', type);
        break;
      }
    }
  } catch (error) {
    console.error(error);
    await sendErrorMessage(bot, message, error);
  }
};
