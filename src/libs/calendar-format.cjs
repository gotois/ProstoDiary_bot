/**
 * @param {object} comp - ICAL Component
 * @param {string} [locale] - locale
 * @returns {string}
 */
function formatCalendarMessage(comp, locale = 'ru') {
  const vevent = comp.getFirstSubcomponent('vevent');
  const eventName = vevent.getFirstPropertyValue('summary');
  let output = '';
  output += '**Создано новое событие:**\n';
  if (eventName) {
    output += eventName + '\n\n';
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
    output += `🏠 **Место:** ${location}\n`;
  }
  const eventDescription = vevent.getFirstPropertyValue('description');
  output += eventDescription ? `${eventDescription}\n` : '📌 Заметки: -\n';
  output += '\nВаше событие успешно создано!\n';
  // output += 'Вы получите напоминание за 10 минут до начала.';

  return output.trim();
}

module.exports.formatCalendarMessage = formatCalendarMessage;
