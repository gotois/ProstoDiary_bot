const Dialog = require('../../libs/dialog.cjs');
const { sendPrepareAction } = require('../../libs/tg-prepare-action.cjs');
const { generateCalendar } = require('../../controllers/generate-calendar.cjs');

// todo - перенести в utils и использовать в том числе при registration.cjs
function getHQImage(objectImages) {
  let current;
  if (objectImages.length > 0) {
    let maxWidth = 0;
    for (const photo of objectImages) {
      if (maxWidth < photo.width) {
        maxWidth = photo.width;
        current = photo;
      }
    }
  }
  return current;
}

module.exports = async (bot, message) => {
  const accept = 'text/calendar';
  const dialog = new Dialog(message);
  bot.sendChatAction(message.chat.id, sendPrepareAction(accept));

  const { url, width, height, summary } = getHQImage(dialog.activity.object);
  if (!summary) {
    await bot.setMessageReaction(message.chat.id, message.message_id, {
      reaction: JSON.stringify([
        {
          type: 'emoji',
          emoji: '🤔',
        },
      ]),
    });
    return bot.sendMessage(dialog.activity.target.id, 'Укажите свои намерения в поле caption', {
      parse_mode: 'markdown',
    });
  }
  const [{ queryResult }] = await dialog.text(summary);

  switch (queryResult.intent.displayName) {
    case 'OrganizeAction': {
      dialog.activity.object = [
        {
          type: 'Note',
          content: queryResult.queryText,
          mediaType: 'text/plain',
        },
        {
          type: 'Link',
          href: url,
          width: width,
          height: height,
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
      return bot.sendMessage(dialog.activity.target.id, queryResult.fulfillmentText || 'Попробуйте написать что-то другое', {
        parse_mode: 'markdown',
      });
    }
  }

  await generateCalendar(bot, dialog);

  //   bot.sendPhoto(
  //       message.chat.id,
  //       photo,
  //       {
  //         caption: 'kek',
  //       },
  //       {
  //         filename: 'kek',
  //         contentType: 'image/png',
  //       },
  //     );
};
