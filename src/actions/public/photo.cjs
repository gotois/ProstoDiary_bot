const Dialog = require('../../libs/dialog.cjs');
const { formatGoogleCalendarUrl, sentToSecretary } = require('../../controllers/generate-calendar.cjs');
const { saveCalendar } = require('../../libs/database.cjs');
const { sendPrepareMessage, sendCalendarMessage } = require('../../libs/tg-messages.cjs');

module.exports = async (bot, message, user) => {
  const dialog = new Dialog();
  dialog.push(message);
  const me = await bot.getMe();
  dialog.activity.origin = {
    ...dialog.activity.origin,
    name: me.first_name,
    url: 'https://t.me/' + me.username,
  };
  const { data, type } = await sentToSecretary({
    id: dialog.uid,
    activity: dialog.activity,
    jwt: user.jwt,
    language: dialog.language,
  });
  await sendPrepareMessage(bot, message);
  switch (type) {
    case 'text/markdown': {
      await bot.sendMessage(message.chat.id, data, {
        parse_mode: 'MarkdownV2',
        reply_to_message_id: message.message_id,
        protect_content: true,
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
      throw new Error('Unknown type ' + type);
    }
  }
};
