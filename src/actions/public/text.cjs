const requestJsonRpc2 = require('request-json-rpc2').default;
const activitystreams = require('telegram-bot-activitystreams');
const dialogflow = require('@google-cloud/dialogflow');
const { v1: uuidv1 } = require('uuid');
const ICAL = require('ical.js');

const { GIC_RPC, GIC_USER, GIC_PASSWORD, DIALOGFLOW_CREDENTIALS } = process.env;

const sessionClient = new dialogflow.SessionsClient({
  credentials: JSON.parse(DIALOGFLOW_CREDENTIALS),
});

/**
 * @description Детектируем actions. Получаем и разбираем Intent (если есть)
 * @param {string} rawMessage - raw message
 * @param {string} lang - lang
 * @param {string} uid - uuid
 * @returns {Promise<object[]>}
 */
const detect = async (rawMessage, lang, uid) => {
  const sessionPath = sessionClient.projectAgentSessionPath('prostodiary', uid);
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: rawMessage,
        languageCode: lang,
      },
    },
  };
  const responses = await sessionClient.detectIntent(request);
  return responses;
};

/**
 * @param {string} ical - icalendar string
 * @param {string} [locale] - locale
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
    const date = new Date(dtStart.toString().replace('Z', ''));
    // Завтра
    const dateString = `(${new Intl.DateTimeFormat(locale).format(date)})`;
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
  output += eventDescription ? `Описание: ${eventDescription}\n` : '📌 Заметки: -\n';
  output += '\nВаше событие успешно создано!\n';
  // output += 'Вы получите напоминание за 10 минут до начала.';

  return output.trim();
}

module.exports = async (bot, message) => {
  message.from.language_code = 'ru'; // todo - пока поддерживаем только русский язык
  const activity = activitystreams(message);
  const id = uuidv1();
  await bot.sendChatAction(activity.target.id, 'typing');
  const [{queryResult}] = await detect(message.text, message.from.language_code, id);
  console.log('id', queryResult.fulfillmentText)

  if (queryResult.intent.displayName !== 'OrganizeAction') {
    return bot.sendMessage(
      activity.target.id,
      queryResult.fulfillmentText,
      {
        parse_mode: 'markdown',
      },
    );
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
      'accept-language': queryResult.languageCode,
    },
  });
  if (error) {
    console.error(error);
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
  console.log('result', result);
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
