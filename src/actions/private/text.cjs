const Dialog = require('../../libs/dialog.cjs');
const { sendPrepareAction } = require('../../libs/tg-prepare-action.cjs');
const { generateCalendar } = require('../../controllers/generate-calendar.cjs');

async function privateDialog(dialog) {
  const [{ queryResult }] = await dialog.text(dialog.message.text);
  dialog.message.from.language_code = queryResult.languageCode;
  switch (queryResult.intent.displayName) {
    case 'OrganizeAction': {
      break;
    }
    default: {
      throw new Error(queryResult.fulfillmentText || 'Попробуйте написать что-то другое');
    }
  }
  if (!queryResult.intent.endInteraction) {
    // todo - если это не финальный интерактив, то продолжать диалог
    //  ...
  }
}

module.exports = async (bot, message) => {
  const dialog = new Dialog(message);
  const accept = 'text/calendar';

  bot.sendChatAction(dialog.message.chat.id, sendPrepareAction(accept));

  try {
    await privateDialog(dialog);
    await generateCalendar(bot, dialog);
  } catch (error) {
    console.error('DialogflowError:', error);
    await bot.setMessageReaction(dialog.message.chat.id, dialog.message.message_id, {
      reaction: JSON.stringify([
        {
          type: 'emoji',
          emoji: '🤷‍♀',
        },
      ]),
    });
    return bot.sendMessage(dialog.activity.target.id, error.message, {
      parse_mode: 'markdown',
      disable_web_page_preview: true,
    });
  }
};
