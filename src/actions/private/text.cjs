const Dialog = require('../../libs/dialog.cjs');
const { generateCalendar, formatCalendarMessage, formatGoogleCalendarUrl } = require('../../controllers/generate-calendar.cjs');
const { saveCalendar } = require('../../libs/database.cjs');
const { notify } = require('../../libs/execute-time.cjs');
const { sendPrepareCalendar, sendCalendarMessage, sendTaskMessage, sendErrorMessage } = require('../../libs/tg-messages.cjs');

module.exports = async (bot, message, user) => {
  const dialog = new Dialog();
  try {
    if (message.text.length < 5) {
      throw new Error('Непонятно');
    }
    await sendPrepareCalendar(bot, message);
    await dialog.push(message);
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
  } catch (error) {
    console.error(error);
    await sendErrorMessage(bot, message, error);
  }
};
