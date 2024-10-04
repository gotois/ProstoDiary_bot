const Dialog = require('../../libs/dialog.cjs');
const { sendPrepareAction } = require('../../libs/tg-prepare-action.cjs');
const { generateCalendar, formatCalendarMessage } = require('../../controllers/generate-calendar.cjs');
const { saveCalendar } = require('../../libs/database.cjs');
const { notify } = require('../../libs/execute-time.cjs');
const { sendCalendarMessage, sendTaskMessage, sendErrorMessage } = require('../../libs/tg-messages.cjs');

module.exports = async (bot, message, user) => {
  const accept = 'text/calendar';
  const dialog = new Dialog();
  bot.sendChatAction(message.chat.id, sendPrepareAction(accept));
  try {
    await dialog.push(message);
    await bot.setMessageReaction(message.chat.id, message.message_id, {
      reaction: JSON.stringify([
        {
          type: 'emoji',
          emoji: '✍',
        },
      ]),
    });
    const me = await bot.getMe();
    dialog.activity.origin.name = me.first_name;
    dialog.activity.origin.url = 'https://t.me/' + me.username;
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
