const requestJsonRpc2 = require('request-json-rpc2');
const activitystreams = require('telegram-bot-activitystreams');
const createEvent = require('ical-browser').default;
const { v1: uuidv1 } = require('uuid');
const { GIC_RPC, GIC_USER, GIC_PASSWORD } = process.env;

module.exports = async (bot, message) => {
  const activity = activitystreams(message);
  const id = uuidv1()
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
      'Accept': 'application/schema+json',
    },
  });
  await bot.sendMessage(activity.target.id, JSON.stringify(response.result, null, 2));
  const fileEvent = createEvent({
    id: id,
    ...response.result,
  });
  const arrayBuffer = await fileEvent.arrayBuffer();
  await bot.sendDocument(activity.target.id, Buffer.from(arrayBuffer), {
      caption: response.result.summary,
    }, {
      filename: fileEvent.name,
      contentType: fileEvent.type,
    });
};
