const ICAL = require('ical.js');
const requestJsonRpc2 = require('request-json-rpc2').default;

const { GIC_RPC } = process.env;

// Функция сериализует текст в стандарт MarkdownV2
function serializeMarkdownV2(text) {
  text = text.replaceAll('.', '\\.');
  text = text.replaceAll('-', '\\-');
  return text;
}

module.exports.formatGoogleCalendarUrl = function(ical) {
  const icalData = ICAL.parse(ical);
  const comp = new ICAL.Component(icalData);
  const vevent = comp.getFirstSubcomponent('vevent');
  const eventName = vevent.getFirstPropertyValue('summary');
  const eventDescription = vevent.getFirstPropertyValue('description');
  const dtStart = vevent.getFirstPropertyValue('dtstart').toString().replace('Z', '');
  const dtEnd = vevent.getFirstPropertyValue('dtend').toString().replace('Z', '');

  const link = new URL('https://calendar.google.com/calendar/render');
  link.searchParams.append('action', 'TEMPLATE');
  link.searchParams.append('text', eventName);
  link.searchParams.append('details', eventDescription);
  if (dtEnd) {
    link.searchParams.append(
      'dates',
      dtStart + '/' + dtEnd,
    )
  } else {
    link.searchParams.append(
      'dates',
      dtStart + '/' + dtStart,
    )
  }
  const location = vevent.getFirstPropertyValue('location');
  if (location) {
    link.searchParams.append('location', location);
  }
  return link;
}

/**
 * @param {string} ical - ical string
 * @param {string} [locale] - locale
 * @returns {string}
 */
module.exports.formatCalendarMessage = (ical, locale = 'ru') => {
  const icalData = ICAL.parse(ical);
  const comp = new ICAL.Component(icalData);
  const vevent = comp.getFirstSubcomponent('vevent');
  const eventName = vevent.getFirstPropertyValue('summary');
  let output = '';
  output += '**Создано новое событие:**\n';
  if (eventName) {
    const category = vevent.getFirstPropertyValue('categories');
    switch (category) {
      case 'деньги': {
        output += '💰';
        break;
      }
      case 'друзья': {
        output += '👫'
        break;
      }
      case 'здоровье': {
        output += '🏥';
        break;
      }
      case 'карьера': {
        output += '💼';
        break;
      }
      case 'личностный рост': {
        output += '📚';
        break;
      }
      case 'любовь':
      case 'отношения':
      case 'любовь и отношения': {
        output += '❤️';
        break;
      }
      case 'отдых':
      case 'развлечения':
      case 'отдых и развлечения': {
        output += '🎉';
        break;
      }
      case 'путешествия': {
        output += '🌴';
        break;
      }
      case 'условия жизни': {
        output += '🏠';
        break;
      }
    }
    output += serializeMarkdownV2(eventName) + '\n\n';
  }
  const dtStart = vevent.getFirstPropertyValue('dtstart').toString().replace('Z', '');
  if (dtStart) {
    const date = new Date(dtStart);
    const dateString = new Intl.DateTimeFormat(locale).format(date);
    output += `📅 **Дата:** ${dateString}\n`;

    if (date.getHours() !== 0) {
      const timeString = new Intl.DateTimeFormat(locale, {
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
      }).format(date);
      output += `🕐 **Время:** ${timeString}\n`;
    }
  }
  const location = vevent.getFirstPropertyValue('location');
  if (location) {
    output += `🏠 **Место:** ${serializeMarkdownV2(location)}\n`;
  }
  const eventDescription = vevent.getFirstPropertyValue('description');
  output += eventDescription ? `📌 ${serializeMarkdownV2(eventDescription)}\n` : '📌 Заметки: \\-\n';
  output += '\nВаше событие успешно создано\\!\n';
  // output += 'Вы получите напоминание за 10 минут до начала.';

  return output.trim();
};

module.exports.generateCalendar = async ({ id, activity, jwt, language }) => {
  const { result, error } = await requestJsonRpc2({
    url: GIC_RPC,
    body: {
      id: id,
      method: 'generate-calendar',
      params: activity,
    },
    jwt: jwt,
    headers: {
      'Accept': 'text/calendar',
      'Accept-Language': language,
    },
  });
  if (error) {
    throw new Error(error.message);
  }
  if (!result) {
    throw new Error('Пожалуйста, уточните дату и время. Даты которые уже прошли не могут быть созданы.');
  }
  const { data, type } = result;
  if (type !== 'text/calendar') {
    throw new Error(data);
  }
  return data;
};
