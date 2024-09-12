const Dialog = require('../../libs/dialog.cjs');
const { sendPrepareAction } = require('../../libs/tg-prepare-action.cjs');
const { generateCalendar } = require('../../controllers/generate-calendar.cjs');
const { formatCalendarMessage } = require('../../libs/calendar-format.cjs');

module.exports = async (bot, message, user) => {
  const accept = 'text/calendar';
  const dialog = new Dialog();
  bot.sendChatAction(message.chat.id, sendPrepareAction(accept));

  await dialog.push(message);
  await bot.setMessageReaction(message.chat.id, message.message_id, {
      reaction: JSON.stringify([
        {
          type: 'emoji',
          emoji: '✍',
        },
      ]),
    });
  const comp = await generateCalendar({
    activity: dialog.activity,
    jwt: user.jwt,
  });
  await bot.sendMessage(message.chat.id, formatCalendarMessage(comp, dialog.language), {
      parse_mode: 'markdown',
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
};
