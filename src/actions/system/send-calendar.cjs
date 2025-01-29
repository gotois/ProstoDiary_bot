const icalendar = require('ical-browser');
const { sendPrepareAction, UPLOAD_DOCUMENT } = require('../../libs/tg-messages.cjs');
const { getCalendarMessage } = require('../../libs/database.cjs');
const { TEXT_CALENDAR } = require('../../libs/mime-types.cjs');

/**
 * @description Отправка файла ical пользователю
 * @param {any} bot - telegram bot
 * @param {any} message - telegram message
 * @returns {Promise<void>}
 */
module.exports = async (bot, message) => {
  await bot.answerCallbackQuery(message.id, {
    text: 'Идет обработка...',
    show_alert: false,
  });
  const event = await getCalendarMessage(message.chat.id + '' + message.message_id);
  const eventIcal = icalendar.event({
    uid: event.message_id,
    start: new Date(event.start),
    end: new Date(event.end),
    summary: event.title,
    description: event.details,
    location: event.location,
  });
  const ical = icalendar.default(message.id, {
    event: eventIcal,
  });
  const fileEvent = new File([new TextEncoder().encode(ical)], event.title + '.ics', {
    type: TEXT_CALENDAR,
  });
  await sendPrepareAction(bot, message, UPLOAD_DOCUMENT);
  const arrayBuffer = await fileEvent.arrayBuffer();
  await bot.sendDocument(
    message.chat.id,
    Buffer.from(arrayBuffer),
    {
      caption: event.details,
      disable_notification: true,
    },
    {
      filename: fileEvent.name,
      contentType: 'application/octet-stream',
    },
  );
};
