const requestJsonRpc2 = require('request-json-rpc2').default;
const activitystreams = require('telegram-bot-activitystreams');
const { v1: uuidv1 } = require('uuid');
const ICAL = require('ical.js');
const { GIC_RPC, GIC_USER, GIC_PASSWORD } = process.env;

/**
 * @param {string} ical
 * @returns {string}
 */
function formatCalendarMessage(ical) {
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
    // Завтра
    const date = `(${new Intl.DateTimeFormat('ru').format(new Date(dtStart.toString()))})`;
    output += `📅 **Дата:** ${date}\n`;
  }
  if (dtStart.hour !== 0 && dtStart.minute !== 0) {
    output += `🕐 **Время:** ${dtStart.hour}:${dtStart.minute}\n`;
  }
  const location = vevent.getFirstPropertyValue('location');
  if (location) {
    output += `🏠 **Место:** ${location}\n`;
  }
  // fixme брать заметки из Event ToDo
  output += `📌 Заметки: -\n`;
  output += '\nВаше событие успешно создано!\n';
  output += 'Вы получите напоминание за 10 минут до начала.';

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
    return await bot.sendMessage(activity.target.id, 'Пожалуйста, уточните дату и время. Даты которые уже прошли не могут быть созданы.', {
      parse_mode: 'markdown',
    });
  }
  await bot.sendMessage(activity.target.id, formatCalendarMessage(result), {
    parse_mode: 'markdown',
  });
  const fileEvent = new File([new TextEncoder().encode(result)], 'calendar.ics', {
    type: 'text/calendar',
  });
  const arrayBuffer = await fileEvent.arrayBuffer();
  await bot.sendChatAction(activity.target.id, 'upload_document');
  await bot.sendDocument(activity.target.id, Buffer.from(arrayBuffer), {
      // caption: result,
      parse_mode: 'markdown',
      disable_notification: true,
    }, {
      filename: fileEvent.name,
      contentType: 'application/octet-stream',
    });
};
