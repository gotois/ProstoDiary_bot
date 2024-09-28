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
  const summary = comp.getFirstSubcomponent('vevent')?.getFirstPropertyValue('summary')?.toLowerCase();
  const description = comp.getFirstSubcomponent('vevent')?.getFirstPropertyValue('description');
  const fileEvent = new File([new TextEncoder().encode(ical)], summary + '.ics', {
    type: 'text/calendar',
  });
  const accept = fileEvent.type;
  bot.sendChatAction(message.chat.id, sendPrepareAction(accept));
  const arrayBuffer = await fileEvent.arrayBuffer();
  await bot.sendDocument(
    message.chat.id,
    Buffer.from(arrayBuffer),
    {
      caption: description ?? null,
      parse_mode: 'MarkdownV2',
      disable_notification: true,
    },
    {
      filename: fileEvent.name,
      contentType: 'application/octet-stream',
    },
  );
};
