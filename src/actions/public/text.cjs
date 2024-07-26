const Dialog = require('../../libs/dialog.cjs');
const { sendPrepareAction } = require('../../libs/tg-prepare-action.cjs');
const { generateCalendar } = require('../../controllers/generate-calendar.cjs');

module.exports = async (bot, message) => {
  const accept = 'text/calendar';
  bot.sendChatAction(message.chat.id, sendPrepareAction(accept));

  const dialog = new Dialog(message);
  try {
    const [{ queryResult }] = await dialog.text(message.text);
    message.from.language_code = queryResult.languageCode;
    switch (queryResult.intent.displayName) {
      case 'OrganizeAction': {
        break;
      }
      default: {
        await bot.setMessageReaction(message.chat.id, message.message_id, {
          reaction: JSON.stringify([
            {
              type: 'emoji',
              emoji: '🤷‍♀',
            },
          ]),
        });
        return bot.sendMessage(
          dialog.activity.target.id,
          queryResult.fulfillmentText || 'Попробуйте написать что-то другое',
          {
            parse_mode: 'markdown',
          },
        );
      }
    }
    if (!queryResult.intent.endInteraction) {
      // todo - если это не финальный интерактив, то продолжать диалог
      //  ...
    }
  } catch (error) {
    console.error('DialogflowError:', error);
  }
  await generateCalendar(bot, dialog);
};
