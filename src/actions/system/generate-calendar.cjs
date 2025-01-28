const { SERVER_APP_URL, IS_DEV } = require('../../environments/index.cjs');
const { notifyCalendar } = require('../../controllers/generate-calendar.cjs');
const { getCalendarMessage } = require('../../libs/database.cjs');

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

/**
 * @description Генерация календаря
 * @param {any} bot - telegram bot
 * @param user
 * @param {any} message - telegram message
 * @returns {Promise<void>}
 */
module.exports = async (bot, message, user) => {
  const event = await getCalendarMessage(message.message_id);

  const googleCalendarUrl = formatGoogleCalendarUrl({
    text: event.title,
    details: event.details,
    location: event.location,
    start: event.start,
    end: event.end,
  });

  await bot.answerCallbackQuery(message.id, {
    text: 'Идет обработка...',
    show_alert: false,
  });
  await bot.setMessageReaction(message.chat.id, message.message_id, {
    reaction: JSON.stringify([
      {
        type: 'emoji',
        emoji: '👀',
      },
    ]),
  });

  // fixme превращаем данные в icalendar
  // ...
  // fixme делаем вызов в notify с передачей ical
  console.log('notify')
  const { credentialSubject } = await notifyCalendar({
    id: message.id,
    activity: {
      title: event.title,
      details: event.details,
      location: event.location,
      start: event.start,
      end: event.end,
      // link: 'https://example.com',
    },
    jwt: user.jwt,
    language: message.from.language_code,
  });
  let webAppUrl = `${SERVER_APP_URL}/?lang=${message.from.language_code}`;
  // eslint-disable-next-line unicorn/consistent-destructuring
  if (IS_DEV) {
    webAppUrl += '&debug=1';
  }

  const editMessage = await bot.editMessageText(credentialSubject.data, {
    chat_id: message.chat.id,
    reply_to_message_id: message.message_id,
    message_id: message.message_id,
    protect_content: true,
    parse_mode: 'MarkdownV2',
    disable_notification: true,
    reply_markup: {
      remove_keyboard: true,
      resize_keyboard: true,
      one_time_keyboard: true,
      inline_keyboard: [
        [
          {
            text: 'Открыть календарь',
            web_app: { url: webAppUrl },
          },
        ],
        [
          {
            text: 'Скачать ICS',
            callback_data: 'send_calendar',
          },
          {
            text: 'В Google Calendar',
            url: googleCalendarUrl,
          },
        ],
      ],
    },
  });
  await bot.pinChatMessage(message.chat.id, editMessage.message_id);
};
