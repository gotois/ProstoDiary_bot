const Dialog = require('../../libs/dialog.cjs');
const { generateCalendar } = require('../../controllers/generate-calendar.cjs');

module.exports = async (bot, message) => {
  const response = await fetch(message.voice.file.url);
  const arrayBuffer = await response.arrayBuffer();
  const dialog = new Dialog(message);
  try {
    const [{ queryResult }] = await dialog.voice(Buffer.from(arrayBuffer));
    message.from.language_code = queryResult.languageCode;
    switch (queryResult.intent.displayName) {
      case 'OrganizeAction': {
        dialog.activity.object = [
          {
            type: 'Note',
            content: queryResult.queryText,
            mediaType: 'text/plain',
          },
        ];
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
    return bot.sendMessage(dialog.activity.target.id, 'Ошибка. Голос нераспознан', {
      parse_mode: 'markdown',
    });
  }
  await generateCalendar(bot, dialog);
};
