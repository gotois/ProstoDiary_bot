const { getUsers } = require('../../libs/database.cjs');
const Dialog = require('../../libs/dialog.cjs');
const { sendPrepareAction } = require('../../libs/tg-prepare-action.cjs');
const { generateCalendar } = require('../../controllers/generate-calendar.cjs');

module.exports = async (bot, message) => {
  const [user] = getUsers(message.from.id);
  const dialog = new Dialog();
  const accept = 'text/calendar';

  bot.sendChatAction(message.chat.id, sendPrepareAction(accept));

  try {
    await privateDialog(dialog);
    await generateCalendar(bot, dialog, user.jwt);
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
