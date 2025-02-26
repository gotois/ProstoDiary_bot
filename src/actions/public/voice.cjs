const { generateCalendar } = require('../../controllers/generate-calendar.cjs');
const { RECORD_AUDIO, sendPrepareAction, sendPrepareMessage } = require('../../libs/tg-messages.cjs');
const { saveCalendar } = require('../../models/calendars.cjs');

module.exports = async (bot, message, dialog) => {
  await sendPrepareAction(bot, message, RECORD_AUDIO);
  dialog.push(message);
  const { reminder, credentialSubject, googleCalendarUrl } = await generateCalendar(dialog);
  await sendPrepareMessage(bot, message);
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
  const myMessage = await bot.sendMessage(message.chat.id, reminder, {
    parse_mode: credentialSubject.object.mediaType === 'text/markdown' ? 'MarkdownV2' : 'Markdown',
    reply_to_message_id: message.message_id,
    protect_content: true,
    disable_notification: true,
    reply_markup: {
      remove_keyboard: true,
      inline_keyboard: inlineKeyboard,
    },
  });
  dialog.saveMessage({
    messageId: myMessage.message_id,
    chatId: message.chat.id,
    text: reminder,
    role: 'assistant',
  });
  await bot.sendMessage(message.chat.id, 'Все верно?', {
    reply_to_message_id: myMessage.message_id,
    disable_notification: true,
    reply_markup: {
      remove_keyboard: false,
      force_reply: true,
    },
  });
  await saveCalendar({
    id: message.chat.id + '' + myMessage.message_id,
    userId: message.chat.id,
    title: credentialSubject.object.name,
    details: credentialSubject.object.summary,
    location: credentialSubject.object.location?.name,
    start: credentialSubject.startTime,
    end: credentialSubject.endTime,
    geo: credentialSubject.object.location['geojson:geometry']?.coordinates,
  });
};
