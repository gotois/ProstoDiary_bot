const Dialog = require('../../libs/dialog.cjs');
const { TYPING, sendPrepareAction } = require('../../libs/tg-messages.cjs');
const { saveCalendar } = require('../../libs/database.cjs');
const { sendPrepareMessage } = require('../../libs/tg-messages.cjs');
const { sentToSecretary } = require('../../controllers/generate-calendar.cjs');

// Добавление события в открываемой ссылке на Google Calendar
function formatGoogleCalendarUrl({ text, details, start, end, location }) {
  const link = new URL('https://calendar.google.com/calendar/render');
  link.searchParams.append('action', 'TEMPLATE');
  link.searchParams.append('text', text);
  link.searchParams.append('details', details);
  if (end) {
    link.searchParams.append('dates', start + '/' + end);
  } else {
    link.searchParams.append('dates', start + '/' + start);
  }
  if (location) {
    link.searchParams.append('location', location);
  }
  return link;
}

module.exports = async (bot, message, user) => {
  await sendPrepareAction(bot, message, TYPING);
  const dialog = new Dialog();
  dialog.push(message);
  const { credentialSubject } = await sentToSecretary({
    id: dialog.uid,
    activity: dialog.activity,
    jwt: user.jwt,
    language: dialog.language,
  });
  const { name, summary, location } = credentialSubject.object;
  const time = new Intl.DateTimeFormat(dialog.language, {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: user.timezone,
  }).format(new Date(credentialSubject.startTime));
  const data =
    `Что: ${name}\n` + `Где: ${location ?? '-'}\n` + `Когда: ${time}\n` + 'Напомнить за: 15 минут\n\n' + 'Все верно?';
  await sendPrepareMessage(bot, message);
  const googleCalendarUrl = formatGoogleCalendarUrl({
    text: name,
    details: summary,
    location: location,
    start: credentialSubject.startTime,
    end: credentialSubject.endTime,
  });
  const myMessage = await bot.sendMessage(message.chat.id, data, {
    parse_mode: 'Markdown',
    reply_to_message_id: message.message_id,
    protect_content: true,
    disable_notification: true,
    reply_markup: {
      inline_keyboard: [
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
      ],
    },
  });
  await saveCalendar({
    id: message.chat.id + '' + myMessage.message_id,
    title: name,
    details: summary,
    location: location,
    start: credentialSubject.startTime,
    end: credentialSubject.endTime,
  });
};
