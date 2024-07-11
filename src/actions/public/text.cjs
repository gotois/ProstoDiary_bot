const requestJsonRpc2 = require('request-json-rpc2').default;
const activitystreams = require('telegram-bot-activitystreams');
const { v1: uuidv1 } = require('uuid');
const Dialog = require('../../libs/dialog.cjs');
const {formatCalendarMessage} = require('../../libs/calendar-format.cjs');

const { GIC_RPC, GIC_USER, GIC_PASSWORD } = process.env;

module.exports = async (bot, message) => {
  message.from.language_code = 'ru'; // todo - пока поддерживаем только русский язык
  const activity = activitystreams(message);
  const id = uuidv1();
  await bot.sendChatAction(activity.target.id, 'typing');

  try {
    const dialog = new Dialog(message);
    const [{ queryResult }] = await dialog.detectAction(message, id);
    message.from.language_code = queryResult.languageCode;
    if (queryResult.intent.displayName !== "OrganizeAction") {
      return bot.sendMessage(
        activity.target.id,
        queryResult.fulfillmentText || "Попробуйте написать что-то другое",
        {
          parse_mode: "markdown",
        },
      );
    }
    if (!queryResult.intent.endInteraction) {
      // todo - если это не финальный интерактив, то продолжать диалог
      //  ...
    }
  } catch {}

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
      'accept-language': message.from.language_code,
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
