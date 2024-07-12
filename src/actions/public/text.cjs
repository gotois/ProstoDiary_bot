const requestJsonRpc2 = require('request-json-rpc2').default;
const activitystreams = require('telegram-bot-activitystreams');
const { v1: uuidv1 } = require('uuid');
const Dialog = require('../../libs/dialog.cjs');
const { formatCalendarMessage } = require('../../libs/calendar-format.cjs');

const { GIC_RPC, GIC_USER, GIC_PASSWORD } = process.env;

module.exports = async (bot, message) => {
  message.from.language_code = 'ru'; // todo - пока поддерживаем только русский язык
  const accept = 'text/calendar';
  const activity = activitystreams(message);
  const id = uuidv1();
  if (accept.startsWith('text/')) {
    await bot.sendChatAction(activity.target.id, 'typing');
  } else if (accept.startsWith('audio/')) {
    await bot.sendChatAction(activity.target.id, 'record_audio');
  }
  const dialog = new Dialog(message);
  try {
    const [{ queryResult }] = await dialog.say(message.text, id);
    message.from.language_code = queryResult.languageCode;
    switch (queryResult.intent.displayName) {
      case 'OrganizeAction': {
        break;
      }
      default: {
        await bot.setMessageReaction(message.chat.id, message.message_id, {
          reaction: JSON.stringify([{
            type: "emoji",
            emoji: "🤷‍♀",
          }]),
        });
        return bot.sendMessage(
          activity.target.id,
          queryResult.fulfillmentText || "Попробуйте написать что-то другое",
          {
            parse_mode: "markdown",
          },
        );
      }
    }
    if (!queryResult.intent.endInteraction) {
      // todo - если это не финальный интерактив, то продолжать диалог
      //  ...
    }
  } catch (error) {
    console.error('DialogflowError: ', error);
  }

  const me = await bot.getMe();
  activity.origin.name = me.first_name;
  activity.origin.url = 'https://t.me/' + me.username;

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
      Accept: accept,
      'accept-language': message.from.language_code,
    },
  });
  if (error) {
    console.error(error);
    await bot.setMessageReaction(message.chat.id, message.message_id, {
      reaction: JSON.stringify([{
        type: "emoji",
        emoji: "👾",
      }]),
    });
    return bot.sendMessage(
      activity.target.id,
      'Произошла ошибка: ' + error.message,
      {
        parse_mode: 'markdown',
      },
    );
  }
  if (!result) {
    return bot.sendMessage(
      activity.target.id,
      'Пожалуйста, уточните дату и время. Даты которые уже прошли не могут быть созданы.',
      {
        parse_mode: 'markdown',
      },
    );
  }
  await bot.setMessageReaction(message.chat.id, message.message_id, {
    reaction: JSON.stringify([{
      type: "emoji",
      emoji: "✍",
    }]),
  });
  await bot.sendMessage(activity.target.id, formatCalendarMessage(result, message.from.language_code), {
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
