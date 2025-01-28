const Dialog = require('../../libs/dialog.cjs');
const { saveCalendar } = require('../../libs/database.cjs');
const { sendPrepareMessage } = require('../../libs/tg-messages.cjs');

module.exports = async (bot, message, user) => {
  await sendPrepareAction(bot, message, TYPING);
  const dialog = new Dialog();
  dialog.push(message);
  const { credentialSubject } = await sentToSecretary({
    id: dialog.uid,
    activity: dialog.activity,
    jwt: user.jwt,
    language: dialog.language,
  });
  const data = credentialSubject.object.contentMap[dialog.language];
  await sendPrepareMessage(bot, message);
  const myMessage = await bot.sendMessage(message.chat.id, data, {
    parse_mode: credentialSubject.object.mediaType === 'text/markdown' ? 'MarkdownV2' : undefined,
    reply_to_message_id: message.message_id,
    protect_content: true,
    disable_notification: true,
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Добавить в календарь',
            callback_data: 'generate_calendar',
          },
        ],
      ],
    },
  });
  // сохраняем в базу SQLite на временное хранилище
  await saveCalendar({
    id: myMessage.message_id, // fixme - взять из from.id + message_id
    title: 'Событие',
    details: 'Описание',
    location: 'Место',
    start: new Date().toISOString(),
    // end: calendarMessage.end,
  });
};
