const requestJsonRpc2 = require('request-json-rpc2');
const activitystreams = require('telegram-bot-activitystreams');
const { creativeWork } = require('text-ld');
const { v1: uuidv1 } = require('uuid');
const { GIC_RPC, GIC_USER, GIC_PASSWORD } = process.env;

module.exports = async (bot, message) => {
  const activity = activitystreams(message);
  const context = await creativeWork(activity.object[0].content);
  await bot.sendMessage(activity.target.id, JSON.stringify(context, null, 2));

  // const response = await requestJsonRpc2({
  //   url: GIC_RPC,
  //   body: {
  //     id: activity.origin.id,
  //     method: 'ping',
  //     params: [],
  //   },
  //   auth: {
  //     'user': GIC_USER,
  //     'pass': GIC_PASSWORD,
  //   },
  //   headers: {
  //     'Accept': 'application/schema+json',
  //   },
  // });
};
