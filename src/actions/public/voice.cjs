const ICAL = require('ical.js');
const requestJsonRpc2 = require('request-json-rpc2').default;
const activitystreams = require('telegram-bot-activitystreams');
const { v1: uuidv1 } = require('uuid');
const Dialog = require('../../libs/dialog.cjs');
const { formatCalendarMessage } = require('../../libs/calendar-format.cjs');
const { executeAtTime } = require('../../libs/execute-time.cjs');

const { GIC_RPC, GIC_USER, GIC_PASSWORD } = process.env;

module.exports = async (bot, message) => {
  message.from.language_code = 'ru'; // todo - пока поддерживаем только русский язык
  const activity = activitystreams(message);
  const id = uuidv1();
  const response = await fetch(message.voice.file.url);
  const arrayBuffer = await response.arrayBuffer();
  const dialog = new Dialog(message, id);
  try {
    const [{ queryResult }] = await dialog.voice(Buffer.from(arrayBuffer));
    message.from.language_code = queryResult.languageCode;
    switch (queryResult.intent.displayName) {
      case 'OrganizeAction': {
        activity.object = [
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
        return bot.sendMessage(activity.target.id, queryResult.fulfillmentText || 'Попробуйте написать что-то другое', {
          parse_mode: 'markdown',
        });
      }
    }
    if (!queryResult.intent.endInteraction) {
      // todo - если это не финальный интерактив, то продолжать диалог
      //  ...
    }
  } catch (error) {
    console.error('DialogflowError:', error);
    return bot.sendMessage(activity.target.id, 'Ошибка. Голос нераспознан', {
      parse_mode: 'markdown',
    });
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
      Accept: 'text/calendar',
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
  if (!result) {
    return bot.sendMessage(
      activity.target.id,
      'Ошибка. Пожалуйста, уточните дату и время. Даты которые уже прошли не могут быть созданы.',
      {
        parse_mode: 'markdown',
      },
    );
  }
  await bot.setMessageReaction(message.chat.id, message.message_id, {
    reaction: JSON.stringify([
      {
        type: 'emoji',
        emoji: '✍',
      },
    ]),
  });
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
  const vevent = comp.getFirstSubcomponent('vevent');
  const dtstart = vevent.getFirstPropertyValue('dtstart').toString().replace('Z', '');
  executeAtTime(new Date(dtstart), async () => {
    let string_ = 'Внимание! У вас есть задача:\n';
    string_ += vevent.getFirstPropertyValue('summary') + '\n';
    string_ += vevent.getFirstPropertyValue('dtstart').toString() + '\n';

    await bot.sendMessage(activity.target.id, string_, {
      parse_mode: 'markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Напомнить через 15 мин',
              callback_data: 'notify_calendar--15',
            },
            {
              text: 'Напомнить через 1 час',
              callback_data: 'notify_calendar--60',
            },
            {
              text: 'Напомнить завтра',
              callback_data: 'notify_calendar--next-day',
            },
          ],
        ],
      },
    });
  });
};
