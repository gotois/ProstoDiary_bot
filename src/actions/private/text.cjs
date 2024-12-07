const Dialog = require('../../libs/dialog.cjs');
const {
  formatCalendarMessage,
  formatGoogleCalendarUrl,
  sentToSecretary,
} = require('../../controllers/generate-calendar.cjs');
const { saveCalendar } = require('../../libs/database.cjs');
const { serializeMarkdownV2 } = require('../../libs/md-serialize.cjs');
const { notify } = require('../../libs/execute-time.cjs');
const {
  sendPrepareMessage,
  sendCalendarMessage,
  sendTaskMessage,
  sendErrorMessage,
} = require('../../libs/tg-messages.cjs');

module.exports = async (bot, message, user) => {
  try {
    const dialog = new Dialog();
    dialog.push(message);
    const { data, type } = await sentToSecretary({
      id: dialog.uid,
      activity: dialog.activity,
      jwt: user.jwt,
      language: dialog.language,
    });
    await sendPrepareMessage(bot, message, type);
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
        const output = formatCalendarMessage(data, dialog.language);
        const googleCalendarUrl = formatGoogleCalendarUrl(data);
        const calendarMessage = await sendCalendarMessage(bot, message, output, googleCalendarUrl.href);
        await saveCalendar(calendarMessage.message_id, user.key, data);
        const { text, url } = await notify(data);
        await sendTaskMessage(bot, calendarMessage, text, url);
        break;
      }
      default: {
        throw new Error('Unknown type ' + type);
      }
    }
  } catch (error) {
    console.error(error);
    await sendErrorMessage(bot, message, error);
  }
};
