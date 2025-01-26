const Dialog = require('../../libs/dialog.cjs');
const { SERVER_APP, IS_DEV } = require('../../environments/index.cjs');
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

  let webAppUrl = `${SERVER_APP}/?lang=${message.from.language_code}`;
  // eslint-disable-next-line unicorn/consistent-destructuring
  if (IS_DEV) {
    webAppUrl += '&debug=1';
  }
  switch (credentialSubject.object.mediaType) {
    case 'text/markdown': {
      await bot.sendMessage(message.chat.id, data, {
        parse_mode: 'MarkdownV2',
        reply_to_message_id: message.message_id,
        protect_content: true,
        disable_notification: true,
        reply_markup: {
          remove_keyboard: true,
          resize_keyboard: true,
          one_time_keyboard: true,
          keyboard: [
            [
              {
                text: 'Добавить',
                web_app: { url: webAppUrl },
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
