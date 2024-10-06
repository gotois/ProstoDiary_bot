const Dialog = require('../../libs/dialog.cjs');
const { generateCalendar, formatCalendarMessage, formatGoogleCalendarUrl } = require('../../controllers/generate-calendar.cjs');
const { saveCalendar } = require('../../libs/database.cjs');
const { notify } = require('../../libs/execute-time.cjs');
const { sendPrepareCalendar, sendCalendarMessage, sendTaskMessage, sendErrorMessage } = require('../../libs/tg-messages.cjs');

module.exports = async (bot, messages, user) => {
  console.log(`Обработка транзакции из ${messages.length} сообщений:`);
  const dialog = new Dialog();
  const message = messages[0];
  try {
    await sendPrepareCalendar(bot, message);
    for (const message of messages) {
      await dialog.push(message);
    }
    const ical = await generateCalendar({
      id: dialog.uid,
      activity: dialog.activity,
      jwt: user.jwt,
    });
    const output = formatCalendarMessage(ical, dialog.language);
    const googleCalendarUrl = formatGoogleCalendarUrl(ical);
    const calendarMessage = await sendCalendarMessage(bot, message, output, googleCalendarUrl);
    await saveCalendar(calendarMessage.message_id, user.key, ical);
    const { text, url } = await notify(ical);
    await sendTaskMessage(bot, calendarMessage, text, url);
  } catch (error) {
    console.error(error);
    await sendErrorMessage(bot, message, error);
  }
};
