const requestJsonRpc2 = require('request-json-rpc2').default;
const activitystreams = require('telegram-bot-activitystreams');
const { v1: uuidv1 } = require('uuid');
const ICAL = require('ical.js');
const { GIC_RPC, GIC_USER, GIC_PASSWORD } = process.env;

/**
 * @param {string} ical
 * @param {string} [locale]
 * @returns {string}
 */
function formatCalendarMessage(ical, locale = 'ru') {
  const jcalData = ICAL.parse(ical);
  const comp = new ICAL.Component(jcalData);
  const vevent = comp.getFirstSubcomponent('vevent');

  const eventName = vevent.getFirstPropertyValue('summary');
  let output = '';
  output += '**Создано новое событие:**\n';
  if (eventName) {
    output += eventName + '\n\n';
  }
  const dtStart = vevent.getFirstPropertyValue('dtstart');
  if (dtStart) {
    const date = new Date(dtStart.toString());
    // Завтра
    const dateStr = `(${new Intl.DateTimeFormat(locale).format(date)})`;
    output += `📅 **Дата:** ${dateStr}\n`;

    if (date.getHours() !== 0) {
      const timeStr = new Intl.DateTimeFormat(locale, {
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
      }).format(date);
      output += `🕐 **Время:** ${timeStr}\n`;
    }
  }
  const location = vevent.getFirstPropertyValue('location');
  if (location) {
    output += `🏠 **Место:** ${location}\n`;
  }
  const eventDescription = vevent.getFirstPropertyValue('description');
  if (eventDescription) {
    output += `Описание: ${eventDescription}\n`;
  } else {
    // fixme брать заметки из Event ToDo
    output += `📌 Заметки: -\n`;
  }
  output += '\nВаше событие успешно создано!\n';
  // output += 'Вы получите напоминание за 10 минут до начала.';

  return output.trim();
}

module.exports = async (bot, message) => {
  const activity = activitystreams(message);
  const me = await bot.getMe();
  activity.origin.name = me.first_name;
  activity.origin.url = 'https://t.me/' + me.username;
  const id = uuidv1();
  await bot.sendChatAction(activity.target.id, 'typing');
  const {result} = await requestJsonRpc2({
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
      'Accept': 'text/calendar',
      // 'accept-language': message.from.language_code,
    },
  });
  console.log('result', result)
  if (!result) {
    return await bot.sendMessage(activity.target.id, 'Ошибка. Пожалуйста, уточните дату и время. Даты которые уже прошли не могут быть созданы.', {
      parse_mode: 'markdown',
    });
  }
  await bot.sendMessage(activity.target.id, formatCalendarMessage(result, message.from.language_code), {
    parse_mode: 'markdown',
    reply_markup: {
      inline_keyboard: [[{
        text: 'Скачать',
        callback_data: 'send_calendar',
      }]],
    },
  });
};
