/**
 * @description Отправка файла ical пользователю
 * @param {any} bot - telegram bot
 * @param {any} message - telegram message
 * @returns {Promise<void>}
 */
module.exports = async (bot, message) => {
  await bot.sendChatAction(message.chat.id, 'upload_document');
  //   // fixme - нужно брать result из БД
  const result = 'ICALENDAR FILE';
  const fileEvent = new File([new TextEncoder().encode(result)], 'calendar.ics', {
    type: 'text/calendar',
  });
  const arrayBuffer = await fileEvent.arrayBuffer();
  await bot.sendDocument(
    message.chat.id,
    Buffer.from(arrayBuffer),
    {
      // caption: result,
      parse_mode: 'markdown',
      disable_notification: true,
    },
    {
      filename: fileEvent.name,
      // contentType: fileEvent.type,
      contentType: 'application/octet-stream',
    },
  );
};
