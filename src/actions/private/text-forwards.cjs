const Dialog = require('../../libs/dialog.cjs');
const { generateCalendar, formatCalendarMessage } = require('../../controllers/generate-calendar.cjs');
const { saveCalendar } = require('../../libs/database.cjs');
const { notify } = require('../../libs/execute-time.cjs');
const { sendCalendarMessage, sendTaskMessage, sendErrorMessage } = require('../../libs/tg-messages.cjs');

module.exports = async (bot, messages, user) => {
  console.log(`Обработка транзакции из ${messages.length} сообщений:`);
  const dialog = new Dialog();
  const message = messages[0];
  try {
    for (const message of messages) {
      await dialog.push(message);
    }
    const ical = await generateCalendar({
      id: dialog.uid,
      activity: dialog.activity,
      jwt: user.jwt,
    });
    const output = formatCalendarMessage(ical, dialog.language);
    const calendarMessage = await sendCalendarMessage(bot, message, output);
    await saveCalendar(calendarMessage.message_id, user.key, ical);
    const task = await notify(ical);
    await sendTaskMessage(bot, calendarMessage, task);
  } catch (error) {
    console.error(error);
    await sendErrorMessage(bot, message, error);
  }
};
