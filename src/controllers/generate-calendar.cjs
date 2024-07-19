const ICAL = require('ical.js');
const requestJsonRpc2 = require('request-json-rpc2').default;
const { formatCalendarMessage } = require('../libs/calendar-format.cjs');
const { executeAtTime } = require('../libs/execute-time.cjs');

const { GIC_RPC, GIC_USER, GIC_PASSWORD } = process.env;

module.exports.generateCalendar = async (bot, dialog) => {
  const { result, error } = await requestJsonRpc2({
    url: GIC_RPC,
    body: {
      id: dialog.uid,
      method: 'generate-calendar',
      params: dialog.activity,
    },
    auth: {
      user: GIC_USER,
      pass: GIC_PASSWORD,
    },
    headers: {
      'Accept': 'text/calendar',
      'accept-language': dialog.message.from.language_code,
    },
  });
  if (error) {
    console.error(error);
    await bot.setMessageReaction(dialog.activity.target.id, dialog.message.message_id, {
      reaction: JSON.stringify([
        {
          type: 'emoji',
          emoji: '👾',
        },
      ]),
    });
    return bot.sendMessage(dialog.activity.target.id, 'Произошла ошибка: ' + error.message, {
      parse_mode: 'markdown',
    });
  }
  if (!result) {
    return bot.sendMessage(
      dialog.activity.target.id,
      'Пожалуйста, уточните дату и время. Даты которые уже прошли не могут быть созданы.',
      {
        parse_mode: 'markdown',
      },
    );
  }
  await bot.setMessageReaction(dialog.activity.target.id, dialog.message.message_id, {
    reaction: JSON.stringify([
      {
        type: 'emoji',
        emoji: '✍',
      },
    ]),
  });
  const icalData = ICAL.parse(result);
  const comp = new ICAL.Component(icalData);
  await bot.sendMessage(dialog.activity.target.id, formatCalendarMessage(comp, dialog.message.from.language_code), {
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

    await bot.sendMessage(dialog.activity.target.id, string_, {
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
