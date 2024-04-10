const requestJsonRpc2 = require('request-json-rpc2');
const activitystreams = require('telegram-bot-activitystreams');
const { GIC_RPC, GIC_USER, GIC_PASSWORD } = process.env;

// Проверка сети
module.exports = async (bot, message) => {
  bot.sendChatAction(message.chat.id, 'typing');
  const activity = activitystreams(message);
  const response = await requestJsonRpc2({
    url: GIC_RPC,
    body: {
      id: activity.origin.id,
      method: 'ping',
      params: [],
    },
    auth: {
      'user': GIC_USER,
      'pass': GIC_PASSWORD,
    },
    headers: {
      'Accept': 'text/markdown',
    },
  });
  if (response.error) {
    await bot.sendMessage(activity.target.id, response.error.message, {
      parse_mode: 'markdown',
    });
  } else {
    await bot.sendMessage(activity.target.id, response.result, {
      parse_mode: 'markdown',
    });
  }
};
