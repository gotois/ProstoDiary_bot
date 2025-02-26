const { TYPING, sendPrepareMessage, sendPrepareAction } = require('../../libs/tg-messages.cjs');
const { saveCalendar } = require('../../models/calendars.cjs');
const { generateCalendar } = require('../../controllers/generate-calendar.cjs');

module.exports = async (bot, userMessage, dialog) => {
  await sendPrepareAction(bot, userMessage, TYPING);
  dialog.push(userMessage);
  const { credentialSubject, reminder, googleCalendarUrl } = await generateCalendar(dialog);
  await sendPrepareMessage(bot, userMessage);
  const inlineKeyboard = [];
  inlineKeyboard.push(
    [
      {
        text: '☑️ Добавить в календарь',
        callback_data: 'generate_calendar',
      },
    ],
    [
      {
        text: 'Открыть в Google Calendar',
        url: googleCalendarUrl,
      },
    ],
  );
  const assistMessage = await bot.sendMessage(userMessage.chat.id, reminder, {
    parse_mode: 'Markdown',
    reply_to_message_id: userMessage.message_id,
    protect_content: true,
    disable_notification: true,
    reply_markup: {
      remove_keyboard: true,
      inline_keyboard: inlineKeyboard,
    },
  });
  dialog.push(assistMessage);
  await bot.sendMessage(userMessage.chat.id, 'Все верно?', {
    reply_to_message_id: assistMessage.message_id,
    disable_notification: true,
    reply_markup: {
      remove_keyboard: false,
      force_reply: true,
    },
  });
  await saveCalendar({
    id: userMessage.chat.id + '' + assistMessage.message_id,
    userId: userMessage.chat.id,
    title: credentialSubject.object.name,
    details: credentialSubject.object.summary,
    location: credentialSubject.object.location?.name,
    start: credentialSubject.startTime,
    end: credentialSubject.endTime,
    geo: credentialSubject.object.location['geojson:geometry']?.coordinates,
  });
};
