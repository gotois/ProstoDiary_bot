const Dialog = require('../../libs/dialog.cjs');
const { TYPING, sendPrepareMessage, sendPrepareAction } = require('../../libs/tg-messages.cjs');
const { saveCalendar } = require('../../libs/database.cjs');
const { generateCalendar } = require('../../controllers/generate-calendar.cjs');

/**
 * @description Добавление события в открываемой ссылке на Google Calendar
 * @param {object} o - object
 * @param {string} o.text - text
 * @param {string} [o.details] - details
 * @param {string} o.start - start
 * @param {string} [o.end] - end
 * @param {string} [o.location] - location
 * @returns {module:url.URL}
 */
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
  const dialog = new Dialog(user);
  dialog.push(message);
  const { credentialSubject } = await generateCalendar(dialog);
  const { name, summary, location } = credentialSubject.object;
  const time = new Intl.DateTimeFormat(dialog.language, {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(credentialSubject.startTime);
  const data =
    `Что: ${name}\n` +
    `Где: ${location?.name ?? '-'}\n` +
    `Когда: ${time}\n` +
    'Напомнить за: 15 минут\n\n' + // todo убрать хардкод
    'Все верно?';
  await sendPrepareMessage(bot, message);
  const googleCalendarUrl = formatGoogleCalendarUrl({
    text: name,
    details: summary,
    location: location?.name,
    start: credentialSubject.startTime,
    end: credentialSubject.endTime,
  });
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
  const myMessage = await bot.sendMessage(message.chat.id, data, {
    parse_mode: 'Markdown',
    reply_to_message_id: message.message_id,
    protect_content: true,
    disable_notification: true,
    reply_markup: {
      remove_keyboard: true,
      inline_keyboard: inlineKeyboard,
    },
  });
  await saveCalendar({
    id: message.chat.id + '' + myMessage.message_id,
    title: name,
    details: summary,
    location: location?.name,
    start: credentialSubject.startTime,
    end: credentialSubject.endTime,
    geo: location['geojson:geometry']?.coordinates,
  });
};
