const Dialog = require('../../libs/dialog.cjs');
const { generateCalendar, formatCalendarMessage } = require('../../controllers/generate-calendar.cjs');
const { saveCalendar } = require('../../libs/database.cjs');

module.exports = async (bot, message, user) => {
  const dialog = new Dialog();
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
};
