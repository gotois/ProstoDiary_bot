const ICAL = require('ical.js');
const { sendPrepareAction } = require('../../libs/tg-prepare-action.cjs');
const { getCalendars } = require('../../libs/database.cjs');
/**
 * @description Отправка файла ical пользователю
 * @param {any} bot - telegram bot
 * @param {any} message - telegram message
 * @returns {Promise<void>}
 */
module.exports = async (bot, message) => {
  const [{ ical }] = await getCalendars(message.message_id, message.chat.id);
  const icalData = ICAL.parse(ical);
  const comp = new ICAL.Component(icalData);
  const fileEvent = new File([new TextEncoder().encode(ical)], 'calendar.ics', {
    type: 'text/calendar',
  });
  const accept = fileEvent.type;
  bot.sendChatAction(message.chat.id, sendPrepareAction(accept));
  const arrayBuffer = await fileEvent.arrayBuffer();
  const caption = comp.getFirstSubcomponent('vevent')?.getFirstPropertyValue('summary');
  await bot.sendDocument(
    message.chat.id,
    Buffer.from(arrayBuffer),
    {
      caption: caption ?? null,
      parse_mode: 'markdown',
      disable_notification: true,
    },
    {
      filename: fileEvent.name,
      contentType: 'application/octet-stream',
    },
  );
};
