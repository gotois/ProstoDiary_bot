const Dialog = require('../../libs/dialog.cjs');
const { generateCalendar, formatCalendarMessage } = require('../../controllers/generate-calendar.cjs');
const { saveCalendar } = require('../../libs/database.cjs');
const { notify } = require('../../libs/execute-time.cjs');

module.exports = async (bot, message, user) => {
  const dialog = new Dialog();
  try {
    await dialog.push(message);
    await bot.setMessageReaction(message.chat.id, message.message_id, {
      reaction: JSON.stringify([
        {
          type: 'emoji',
          emoji: '✍',
        },
      ]),
    });
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
    const task = await notify(ical);
    await bot.sendMessage(message.chat.id, task, {
      parse_mode: 'MarkdownV2',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Напомнить через 15 мин',
              callback_data: 'notify_calendar--15',
            },
          ],
          [
            {
              text: 'Напомнить через 1 час',
              callback_data: 'notify_calendar--60',
            },
          ],
          [
            {
              text: 'Напомнить завтра',
              callback_data: 'notify_calendar--next-day',
            },
          ],
        ],
      },
    });
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
