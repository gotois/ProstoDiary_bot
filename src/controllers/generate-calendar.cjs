const ICAL = require('ical.js');
const requestJsonRpc2 = require('request-json-rpc2').default;

const { GIC_RPC } = process.env;

module.exports.generateCalendar = async (bot, dialog, jwt) => {
  const me = await bot.getMe();
  dialog.activity.origin.name = me.first_name;
  dialog.activity.origin.url = 'https://t.me/' + me.username;

  const { result, error } = await requestJsonRpc2({
    url: GIC_RPC,
    body: {
      id: dialog.uid,
      method: 'generate-calendar',
      params: activity,
    },
    jwt: jwt,
    headers: {
      'Accept': 'text/calendar',
      'accept-language': dialog.message.from.language_code,
    },
  });
  if (error) {
    console.error(error);
    throw new Error(error.message);
  }
  if (!result) {
    throw new Error('Пожалуйста, уточните дату и время. Даты которые уже прошли не могут быть созданы.');
  }
  const { data, type } = result;
  if (type !== 'text/calendar') {
    throw new Error(data);
  }
  const icalData = ICAL.parse(data);
  return new ICAL.Component(icalData);
};
