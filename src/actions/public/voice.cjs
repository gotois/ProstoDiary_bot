const { generateCalendar } = require('../../controllers/generate-calendar.cjs');
const { RECORD_AUDIO, sendPrepareAction, sendPrepareMessage } = require('../../libs/tg-messages.cjs');
const { saveCalendar } = require('../../models/calendars.cjs');

module.exports = async (bot, userMessage, dialog) => {
  await sendPrepareAction(bot, userMessage, RECORD_AUDIO);
  dialog.push(userMessage);
  const { reminder, credentialSubject, googleCalendarUrl } = await generateCalendar(dialog);
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
    parse_mode: credentialSubject.object.mediaType === 'text/markdown' ? 'MarkdownV2' : 'Markdown',
    reply_to_message_id: userMessage.message_id,
    protect_content: true,
    disable_notification: true,
    reply_markup: {
      remove_keyboard: true,
      inline_keyboard: inlineKeyboard,
    },
  });
  dialog.push(userMessage);
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
