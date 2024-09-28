const Dialog = require('../../libs/dialog.cjs');
const { sendPrepareAction } = require('../../libs/tg-prepare-action.cjs');
const { generateCalendar, formatCalendarMessage } = require('../../controllers/generate-calendar.cjs');
const { saveCalendar } = require('../../libs/database.cjs');

module.exports = async (bot, message, user) => {
  const accept = 'text/calendar';
  const dialog = new Dialog();
  bot.sendChatAction(message.chat.id, sendPrepareAction(accept));

  const { message_id } = await bot.sendMessage(message.chat.id, 'Напиши свои намерения', {
    reply_to_message_id: message.message_id,
    reply_markup: {
      force_reply: true,
    },
  });
  bot.onReplyToMessage(message.chat.id, message_id, async ({ text }) => {
    bot.sendChatAction(message.chat.id, sendPrepareAction(accept));
    message.location.caption = text;
    try {
      await dialog.push(message);
      const ical = await generateCalendar({
        id: dialog.uid,
        activity: dialog.activity,
        jwt: user.jwt,
      });
      const calendarMessage = await bot.sendMessage(message.chat.id, formatCalendarMessage(ical, dialog.language), {
        parse_mode: 'MarkdownV2',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Скачать',
                callback_data: 'send_calendar',
              },
            ],
          ],
        },
      });
      await saveCalendar(calendarMessage.message_id, user.key, ical);
    } catch (error) {
      console.error(error);
      await bot.setMessageReaction(message.chat.id, message.message_id, {
        reaction: JSON.stringify([
          {
            type: 'emoji',
            emoji: '👾',
          },
        ]),
      });
      return bot.sendMessage(message.chat.id, 'Произошла ошибка: ' + error.message, {
        parse_mode: 'MarkdownV2',
      });
    }
  });
};
