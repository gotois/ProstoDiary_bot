const requestJsonRpc2 = require('request-json-rpc2').default;
const activitystreams = require('telegram-bot-activitystreams');
const { v1: uuidv1 } = require('uuid');
const { GIC_RPC, GIC_USER, GIC_PASSWORD } = process.env;

module.exports = async (bot, message) => {
  const activity = activitystreams(message);
  const id = uuidv1();
  const response = await requestJsonRpc2({
    url: GIC_RPC,
    body: {
      id: id,
      method: 'generate-action',
      params: activity,
    },
    auth: {
      'user': GIC_USER,
      'pass': GIC_PASSWORD,
    },
    headers: {
      'Accept': 'text/calendar',
    },
  });
  const {result} = response;
  await bot.sendMessage(activity.target.id, result, {
    parse_mode: 'markdown',
  });
  const fileEvent = new File([new TextEncoder().encode(result)], 'calendar.ics', {
    type: 'text/calendar',
  });
  const arrayBuffer = await fileEvent.arrayBuffer();
  await bot.sendDocument(activity.target.id, Buffer.from(arrayBuffer), {
      caption: 'summary',
    }, {
      filename: fileEvent.name,
      contentType: fileEvent.type,
    });
};
