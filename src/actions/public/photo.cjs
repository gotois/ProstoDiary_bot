const ICAL = require('ical.js');
const requestJsonRpc2 = require('request-json-rpc2').default;
const activitystreams = require('telegram-bot-activitystreams');
const { v1: uuidv1 } = require('uuid');
const Dialog = require('../../libs/dialog.cjs');
const { formatCalendarMessage } = require('../../libs/calendar-format.cjs');

const { GIC_RPC, GIC_USER, GIC_PASSWORD } = process.env;

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
  message.from.language_code = 'ru'; // todo - пока поддерживаем только русский язык
  const activity = activitystreams(message);
  const id = uuidv1();
  console.log('activity', activity);

  const { url, width, height, summary } = getHQImage(activity.object);
  if (!summary) {
    await bot.setMessageReaction(message.chat.id, message.message_id, {
      reaction: JSON.stringify([
        {
          type: 'emoji',
          emoji: '🤔',
        },
      ]),
    });
    return bot.sendMessage(activity.target.id, 'Укажите свои намерения в поле caption', {
      parse_mode: 'markdown',
    });
  }
  const dialog = new Dialog(message, id);
  const [{ queryResult }] = await dialog.text(summary);

  switch (queryResult.intent.displayName) {
    case 'OrganizeAction': {
      activity.object = [
        {
          type: 'Note',
          content: queryResult.queryText,
          mediaType: 'text/plain',
        },
        {
          type: 'Image',
          url: url,
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
      return bot.sendMessage(activity.target.id, queryResult.fulfillmentText || 'Попробуйте написать что-то другое', {
        parse_mode: 'markdown',
      });
    }
  }

  const accept = 'text/calendar';
  const { result, error } = await requestJsonRpc2({
    url: GIC_RPC,
    body: {
      id: id,
      method: 'generate-calendar',
      params: activity,
    },
    auth: {
      user: GIC_USER,
      pass: GIC_PASSWORD,
    },
    headers: {
      'Accept': accept,
      'accept-language': message.from.language_code,
    },
  });
  if (error) {
    console.error(error);
    await bot.setMessageReaction(message.chat.id, message.message_id, {
      reaction: JSON.stringify([
        {
          type: 'emoji',
          emoji: '👾',
        },
      ]),
    });
    return bot.sendMessage(activity.target.id, 'Произошла ошибка: ' + error.message, {
      parse_mode: 'markdown',
    });
  }
  console.log('result', result);
  const icalData = ICAL.parse(result);
  const comp = new ICAL.Component(icalData);
  await bot.sendMessage(activity.target.id, formatCalendarMessage(comp, message.from.language_code), {
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
