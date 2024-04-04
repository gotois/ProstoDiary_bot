const requestJsonRpc2 = require('request-json-rpc2');
const activitystreams = require('telegram-bot-activitystreams');
const { GIC_RPC, GIC_USER, GIC_PASSWORD } = process.env;

module.exports = async (bot, message) => {
  const activity = activitystreams(message);
  const response = await requestJsonRpc2({
    url: GIC_RPC,
    body: {
      id: activity.origin.id,
      method: 'ping',
      params: ['example'],
    },
    auth: {
      'user': GIC_USER,
      'pass': GIC_PASSWORD,
    },
    headers: {
      'Accept': 'application/schema+json',
    },
  });
  if (response.error) {
    await bot.sendMessage(activity.target.id, response.error.message);
  } else {
    await bot.sendMessage(activity.target.id, response.result);
  }
};
