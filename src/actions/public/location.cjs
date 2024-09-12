const { getUsers } = require('../../libs/database.cjs');
const Dialog = require('../../libs/dialog.cjs');
const { sendPrepareAction } = require('../../libs/tg-prepare-action.cjs');
const { generateCalendar } = require('../../controllers/generate-calendar.cjs');

module.exports = async (bot, message) => {
  const [user] = getUsers(message.from.id);
  const accept = 'text/calendar';
  const dialog = new Dialog();
  await dialog.push(message);

  bot.sendChatAction(message.chat.id, sendPrepareAction(accept));

  const { message_id } = await bot.sendMessage(dialog.activity.target.id, 'Напиши свои намерения', {
    reply_to_message_id: message.message_id,
    reply_markup: {
      force_reply: true,
    },
  });
  bot.onReplyToMessage(message.chat.id, message_id, async ({ text }) => {
    bot.sendChatAction(message.chat.id, sendPrepareAction(accept));

    dialog.activity.object = [
      {
        type: 'Note',
        content: text,
        mediaType: 'text/plain',
      },
      {
        type: 'Point',
        content: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [message.location.latitude, message.location.longitude],
          },
        },
        mediaType: 'application/geo+json',
      },
    ];

    await generateCalendar(bot, dialog, user.jwt);
  });
};
