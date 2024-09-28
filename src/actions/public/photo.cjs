const Dialog = require('../../libs/dialog.cjs');
const { sendPrepareAction } = require('../../libs/tg-prepare-action.cjs');
const { generateCalendar, formatCalendarMessage } = require('../../controllers/generate-calendar.cjs');

module.exports = async (bot, message, user) => {
  const accept = 'text/calendar';
  const dialog = new Dialog();
  bot.sendChatAction(message.chat.id, sendPrepareAction(accept));
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
    const me = await bot.getMe();
    dialog.activity.origin.name = me.first_name;
    dialog.activity.origin.url = 'https://t.me/' + me.username;
    const ical = await generateCalendar({
      id: dialog.uid,
      activity: dialog.activity,
      jwt: user.jwt,
    });
    await bot.sendMessage(message.chat.id, formatCalendarMessage(ical, dialog.language), {
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
  } catch (error) {
    console.error(error);
    await bot.setMessageReaction(message.chat.id, message.message_id, {
      reaction: JSON.stringify([
        {
          type: 'emoji',
          emoji: '🤷‍♀',
        },
      ]),
    });
    return bot.sendMessage(message.chat.id, error.message, {
      parse_mode: 'MarkdownV2',
      disable_web_page_preview: true,
    });
  }
};
