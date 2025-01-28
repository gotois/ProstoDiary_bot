const { sendPrepareAction } = require('../../libs/tg-messages.cjs');
const { getCalendarMessage } = require('../../libs/database.cjs');
const { TEXT_CALENDAR } = require('../../libs/mime-types.cjs');

/**
 * @description Отправка файла ical пользователю
 * @param {any} bot - telegram bot
 * @param {any} message - telegram message
 * @returns {Promise<void>}
 */
module.exports = async (bot, message) => {
  const event = await getCalendarMessage(message.message_id);

  // fixme - нужно сгенерировать ical из данных event
  console.log('WIP генерировать ical')

  const fileEvent = new File([new TextEncoder().encode(ical)], event.title + '.ics', {
    type: TEXT_CALENDAR,
  });
  bot.sendChatAction(message.chat.id, sendPrepareAction(fileEvent.type));
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
