const requestJsonRpc2 = require('request-json-rpc2').default;
const activitystreams = require('telegram-bot-activitystreams');
const { v1: uuidv1 } = require('uuid');
const { GIC_RPC, GIC_USER, GIC_PASSWORD } = process.env;

module.exports = async (bot, message) => {
  const activity = activitystreams(message);
  const me = await bot.getMe();
  activity.origin.name = me.first_name;
  activity.origin.url = 'https://t.me/' + me.username;
  const id = uuidv1();
  await bot.sendChatAction(activity.target.id, 'record_audio');
  const { result } = await requestJsonRpc2({
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
  if (!result) {
    return await bot.sendMessage(
      activity.target.id,
      'Ошибка. Пожалуйста, уточните дату и время. Даты которые уже прошли не могут быть созданы.',
      {
        parse_mode: 'markdown',
      },
    );
  }
  await bot.sendMessage(activity.target.id, 'Added', {
    parse_mode: 'markdown',
  });
  const fileEvent = new File([new TextEncoder().encode(result)], 'calendar.ics', {
    type: 'text/calendar',
  });
  const arrayBuffer = await fileEvent.arrayBuffer();
  await bot.sendChatAction(activity.target.id, 'upload_document');
  await bot.sendDocument(
    activity.target.id,
    Buffer.from(arrayBuffer),
    {
      caption: result,
      parse_mode: 'markdown',
      disable_notification: true,
    },
    {
      filename: fileEvent.name,
      contentType: fileEvent.type,
    },
  );
};
