const icalBrowser = require('ical-browser');
const { SERVER_APP_URL, IS_DEV } = require('../../environments/index.cjs');
const { notifyCalendar } = require('../../controllers/generate-calendar.cjs');
const { getCalendarMessage } = require('../../libs/database.cjs');

const ICalendar = icalBrowser.default;

/**
 * @description Генерация календаря и отправка файла ical Секретарю
 * @param {any} bot - telegram bot
 * @param {any} message - telegram message
 * @param {any} user - user data
 * @returns {Promise<void>}
 */
module.exports = async (bot, message, user) => {
  await bot.answerCallbackQuery(message.id, {
    text: 'Идет обработка...',
    show_alert: false,
  });
  const language = message.reply_to_message?.from?.language_code;
  const event = await getCalendarMessage(message.chat.id + '' + message.message_id);
  if (!event) {
    throw new Error('Событие не найдено');
  }
  await bot.setMessageReaction(message.chat.id, message.message_id, {
    reaction: JSON.stringify([
      {
        type: 'emoji',
        emoji: '👀',
      },
    ]),
  });
  const icalendar = new ICalendar();
  const vevent = new icalBrowser.VEvent({
    'uid': message.id + 'event',
    'start': new Date(event.start),
    'end': new Date(event.end),
    'summary': event.title,
    'description': event.details,
    'location': event.location,
    'x-telegram-message-id': message.message_id,
  });
  const valarm = new icalBrowser.VAlarm({
    uid: message.id + 'alarm',
    trigger: '-PT15M', // за 15 минут до начала
    action: 'display',
    description: event.title,
  });
  vevent.addAlarm(valarm);
  icalendar.addEvent(vevent);
  const { credentialSubject } = await notifyCalendar({
    id: message.id,
    ics: icalendar.ics,
    jwt: user.jwt,
    language: language,
  });
  let webAppUrl = `${SERVER_APP_URL}/?lang=${language}`;
  // eslint-disable-next-line unicorn/consistent-destructuring
  if (IS_DEV) {
    webAppUrl += '&debug=1';
  }
  let parseMode = null;
  switch (credentialSubject.object.mediaType) {
    case 'text/markdown': {
      parseMode = 'MarkdownV2';
      break;
    }
    case 'text/html': {
      parseMode = 'HTML';
      break;
    }
    default: {
      break;
    }
  }
  const editMessage = await bot.editMessageText(credentialSubject.object.content, {
    chat_id: message.chat.id,
    reply_to_message_id: message.reply_to_message.message_id,
    message_id: message.message_id,
    protect_content: true,
    parse_mode: parseMode,
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
  await bot.pinChatMessage(message.chat.id, editMessage.message_id);
};
