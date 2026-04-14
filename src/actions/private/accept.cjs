const { randomUUID } = require('node:crypto');
const jsonRpc = require('request-json-rpc2').default;
const { SECRETARY } = require('../../environments/index.cjs');
const { getUser } = require('../../models/users.cjs');

module.exports = async (bot, message) => {
  const user = getUser(message.chat.id);
  const [_method, userId, activityId] = message.data.split(':');

  await bot.answerCallbackQuery(message.id, {
    text: 'Идет обработка...',
    show_alert: false,
  });

  const { result } = await jsonRpc({
    url: SECRETARY.RPC,
    body: {
      jsonrpc: '2.0',
      id: randomUUID(),
      method: 'approval',
      params: {
        activity_id: activityId,
        user_id: userId,
        type: 'accept',
      },
    },
    headers: {
      Authorization: `Bearer ${user.access_token}`,
    },
  });
  if (!result) {
    return;
  }

  await bot.editMessageText(`<s>${message.text}</s>\n\nПриглашение отправлено`, {
    chat_id: message.chat.id,
    message_id: message.message_id,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [],
    },
  });
};
