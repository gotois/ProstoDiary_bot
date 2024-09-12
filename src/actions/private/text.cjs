const Dialog = require('../../libs/dialog.cjs');
const { sendPrepareAction } = require('../../libs/tg-prepare-action.cjs');
const { generateCalendar } = require('../../controllers/generate-calendar.cjs');
const { formatCalendarMessage } = require('../../libs/calendar-format.cjs');

module.exports = async (bot, message, user) => {
  const dialog = new Dialog();
  const accept = 'text/calendar';

  bot.sendChatAction(message.chat.id, sendPrepareAction(accept));

  try {
    await dialog.push(message);
    const comp = await generateCalendar({
      activity: dialog.activity,
      jwt: user.jwt,
    });
    await bot.setMessageReaction(message.chat.id, message.message_id, {
      reaction: JSON.stringify([
        {
          type: 'emoji',
          emoji: '✍',
        },
      ]),
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
  } catch (error) {
    console.error('DialogflowError:', error);
    await bot.setMessageReaction(message.chat.id, message.message_id, {
      reaction: JSON.stringify([
        {
          type: 'emoji',
          emoji: '🤷‍♀',
        },
      ]),
    });
    return bot.sendMessage(message.chat.id, error.message, {
      parse_mode: 'markdown',
      disable_web_page_preview: true,
    });
  }
};
