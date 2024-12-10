const Dialog = require('../../libs/dialog.cjs');
const {
  sentToSecretary,
  formatCalendarMessage,
  formatGoogleCalendarUrl,
} = require('../../controllers/generate-calendar.cjs');
const { serializeMarkdownV2 } = require('../../libs/md-serialize.cjs');
const { saveCalendar } = require('../../libs/database.cjs');
const { notify } = require('../../libs/execute-time.cjs');
const {
  sendPrepareMessage,
  sendCalendarMessage,
  sendTaskMessage,
  sendErrorMessage,
} = require('../../libs/tg-messages.cjs');

module.exports = async (bot, message, user) => {
  await sendPrepareMessage(bot, message);

  const { message_id } = await bot.sendMessage(message.chat.id, 'Напиши свои намерения', {
    reply_to_message_id: message.message_id,
    reply_markup: {
      force_reply: true,
    },
  });
  bot.onReplyToMessage(message.chat.id, message_id, async ({ text }) => {
    message.location.caption = text;
    try {
      await sendPrepareMessage(bot, message);
      const dialog = new Dialog();
      dialog.push(message);
      const { data, type } = await sentToSecretary({
        id: dialog.uid,
        activity: dialog.activity,
        jwt: user.jwt,
        language: dialog.language,
      });
      await sendPrepareMessage(bot, message);
      switch (type) {
        case 'text/markdown': {
          await bot.sendMessage(message.chat.id, serializeMarkdownV2(data), {
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
          const output = formatCalendarMessage(data, dialog.language);
          const googleCalendarUrl = formatGoogleCalendarUrl(data);
          const calendarMessage = await sendCalendarMessage(bot, message, output, googleCalendarUrl.href);
          await saveCalendar(calendarMessage.message_id, user.key, data);
          const { text, url } = await notify(data);
          await sendTaskMessage(bot, calendarMessage, text, url);
          break;
        }
        default: {
          throw new Error('Unknown type ' + type);
        }
      }
    } catch (error) {
      console.error(error);
      await sendErrorMessage(bot, message, error);
    }
  });
};
