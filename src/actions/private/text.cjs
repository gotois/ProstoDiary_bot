const Dialog = require('../../libs/dialog.cjs');
const { sendPrepareAction } = require('../../libs/tg-prepare-action.cjs');
const { generateCalendar, formatCalendarMessage } = require('../../controllers/generate-calendar.cjs');
const { saveCalendar } = require('../../libs/database.cjs');
const { notify } = require('../../libs/execute-time.cjs');
const { sendCalendarMessage, sendTaskMessage, sendErrorMessage } = require('../../libs/tg-messages.cjs');

module.exports = async (bot, message, user) => {
  const dialog = new Dialog();
  try {
    if (message.text.length < 5) {
      throw new Error('Непонятно');
    }
    const accept = 'text/calendar';
    await bot.sendChatAction(message.chat.id, sendPrepareAction(accept));
    await dialog.push(message);
    const ical = await generateCalendar({
      id: dialog.uid,
      activity: dialog.activity,
      jwt: user.jwt,
      language: dialog.language,
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
