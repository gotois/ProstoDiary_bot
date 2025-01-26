module.exports.RECORD_AUDIO = 'record_audio';
module.exports.TYPING = 'typing';
module.exports.UPLOAD_DOCUMENT = 'upload_document';

module.exports.sendPrepareAction = async function (bot, message, type) {
  await bot.sendChatAction(message.chat.id, type);
};

module.exports.sendPrepareMessage = async function (bot, message) {
  await bot.setMessageReaction(message.chat.id, message.message_id, {
    reaction: JSON.stringify([
      {
        type: 'emoji',
        emoji: '✍',
      },
    ]),
  });
};

module.exports.sendCalendarMessage = async function (bot, message, output, googleCalendarUrl) {
  const keyboardDownloadCalendar = {
    text: 'Скачать ICS',
    callback_data: 'send_calendar',
  };
  const keyboardGoogleCalendar = {
    text: 'В Google Calendar',
    url: googleCalendarUrl,
  };
  const calendarMessage = await bot.sendMessage(message.chat.id, output, {
    reply_to_message_id: message.message_id,
    parse_mode: 'MarkdownV2',
    protect_content: true,
    reply_markup: {
      inline_keyboard: [[keyboardDownloadCalendar, keyboardGoogleCalendar]],
    },
  });
  try {
    await bot.pinChatMessage(message.chat.id, calendarMessage.message_id);
  } catch (error) {
    console.error(error);
  }
  return calendarMessage;
};
