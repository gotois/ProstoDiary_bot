const icalBrowser = require('ical-browser');
const { SERVER } = require('../../environments/index.cjs');
const { notifyCalendar } = require('../../controllers/generate-calendar.cjs');
const { getCalendarMessage } = require('../../models/calendars.cjs');
const { parseMode } = require('../../libs/tg-messages.cjs');

const ICalendar = icalBrowser.default;

/**
 * @description Генерация календаря и отправка файла ical Секретарю
 * @param {any} bot - telegram bot
 * @param {any} message - telegram message
 * @param {any} dialog - dialog data
 * @returns {Promise<void>}
 */
module.exports = async (bot, message, dialog) => {
  const { user } = dialog;
  await bot.answerCallbackQuery(message.id, {
    text: 'Идет обработка...',
    show_alert: false,
  });
  const event = await getCalendarMessage(message.chat.id + '' + message.message_id);
  if (!event) {
    throw new Error('Событие не найдено');
  }
  await bot.setMessageReaction(message.chat.id, message.reply_to_message.message_id, {
    reaction: JSON.stringify([
      {
        type: 'emoji',
        emoji: '👀',
      },
    ]),
  });
  const icalendar = new ICalendar();
  const startDate = new Date(event.start);
  const endDate = new Date(event.end);
  const vevent = new icalBrowser.VEvent({
    'uid': message.id + 'event',
    'start': new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60_000),
    'startTz': user.timezone,
    'end': endDate,
    'endTz': user.timezone,
    'geo': JSON.parse(event.geo ?? []),
    'summary': event.title,
    'description': event.details,
    'location': event.location,
    'x-telegram-message-id': message.message_id,
  });
  const valarm = new icalBrowser.VAlarm({
    uid: message.id + 'alarm',
    trigger: 'RELATED=START:-PT15M', // за 15 минут до начала
    action: 'display',
    description: event.title,
  });
  vevent.addAlarm(valarm);
  icalendar.addEvent(vevent);
  if (SERVER.IS_DEV) {
    const fileEvent = icalendar.download('calendar.ics');
    const arrayBuffer = await fileEvent.arrayBuffer();
    await bot.sendDocument(
      message.chat.id,
      Buffer.from(arrayBuffer),
      {
        caption: 'Calendar',
        disable_notification: true,
      },
      {
        filename: fileEvent.name,
        contentType: 'application/octet-stream',
      },
    );
  }
  const { credentialSubject } = await notifyCalendar({
    ics: icalendar.ics,
    user: user,
  });
  dialog.clear();
  let webAppUrl = `${SERVER.APP_URL}/?lang=${message.reply_to_message?.from?.language_code}`;
  // eslint-disable-next-line unicorn/consistent-destructuring
  if (SERVER.IS_DEV) {
    webAppUrl += '&debug=1';
  }
  const editMessage = await bot.editMessageText(credentialSubject.object.content, {
    chat_id: message.chat.id,
    reply_to_message_id: message.reply_to_message.message_id,
    message_id: message.message_id,
    protect_content: true,
    parse_mode: parseMode(credentialSubject.object.mediaType),
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
      ],
    },
  });
  await bot.setMessageReaction(message.chat.id, editMessage.message_id, {
    reaction: JSON.stringify([]),
  });
  await bot.pinChatMessage(message.chat.id, editMessage.message_id);
};
