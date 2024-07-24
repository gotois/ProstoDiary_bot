const Dialog = require('../../libs/dialog.cjs');
const requestJsonRpc2 = require('request-json-rpc2').default;
const { sendPrepareAction } = require('../../libs/tg-prepare-action.cjs');

const { GIC_RPC, GIC_USER, GIC_PASSWORD } = process.env;

// Проверка сети
module.exports = async (bot, message) => {
  const dialog = new Dialog(message);
  const accept = 'text/markdown';
  bot.sendChatAction(message.chat.id, sendPrepareAction(accept));
  const response = await requestJsonRpc2({
    url: GIC_RPC,
    body: {
      id: dialog.activity.origin.id,
      method: 'ping',
      params: [],
    },
    auth: {
      user: GIC_USER,
      pass: GIC_PASSWORD,
    },
    headers: {
      Accept: accept,
    },
  });
  if (response.error) {
    await bot.setMessageReaction(message.chat.id, message.message_id, {
      reaction: JSON.stringify([
        {
          type: 'emoji',
          emoji: '👾',
        },
      ]),
    });
    await bot.sendMessage(dialog.activity.target.id, response.error.message, {
      parse_mode: 'markdown',
    });
  } else {
    await bot.sendMessage(dialog.activity.target.id, response.result, {
      parse_mode: 'markdown',
    });
  }
};
