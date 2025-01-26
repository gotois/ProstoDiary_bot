const Dialog = require('../../libs/dialog.cjs');
const { formatGoogleCalendarUrl, sentToSecretary } = require('../../controllers/generate-calendar.cjs');
const { saveCalendar } = require('../../libs/database.cjs');
const { TYPING, sendPrepareAction, sendPrepareMessage, sendCalendarMessage } = require('../../libs/tg-messages.cjs');

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
  switch (credentialSubject.object.mediaType) {
    case 'text/markdown': {
      await bot.sendMessage(message.chat.id, data, {
        parse_mode: 'MarkdownV2',
        reply_to_message_id: message.message_id,
        protect_content: true,
        disable_notification: true,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Сгенерировать календарь',
                callback_data: 'generate_calendar',
              },
            ],
          ],
        },
      });
      break;
    }
    case 'text/plain': {
      await bot.sendMessage(message.chat.id, data, {
        reply_to_message_id: message.message_id,
        protect_content: true,
      });
      break;
    }
    case 'text/calendar': {
      const googleCalendarUrl = formatGoogleCalendarUrl(data);
      const calendarMessage = await sendCalendarMessage(bot, message, data, googleCalendarUrl.href);
      await saveCalendar(calendarMessage.message_id, user.key, data);
      break;
    }
    default: {
      throw new Error('Unknown type ' + credentialSubject.object.mediaType);
    }
  }
};
