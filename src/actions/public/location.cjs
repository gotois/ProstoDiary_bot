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

  const { message_id } = await bot.sendMessage(message.chat.id, 'Напиши свои намерения', {
    reply_to_message_id: message.message_id,
    reply_markup: {
      force_reply: true,
    },
  });
  bot.onReplyToMessage(message.chat.id, message_id, async ({ text }) => {
    bot.sendChatAction(message.chat.id, sendPrepareAction(accept));
    message.location.caption = text;
    try {
      await dialog.push(message);
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
  });
};
