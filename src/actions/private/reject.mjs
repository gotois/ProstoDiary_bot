import { randomUUID } from 'node:crypto';
import jsonRpc from 'request-json-rpc2';
import env from '../../environments/index.mjs';
import { getUser } from '../../models/users.mjs';

const { SECRETARY } = env;

export default async (bot, message) => {
  const user = getUser(message.chat.id);
  const [_method, userId, activityId] = message.data.split(':');

  await bot.answerCallbackQuery(message.id, {
    text: 'Идет обработка...',
    show_alert: false,
  });

  const { result } = await jsonRpc.default({
    url: SECRETARY.RPC,
    body: {
      jsonrpc: '2.0',
      id: randomUUID(),
      method: 'approval',
      params: {
        activity_id: activityId,
        user_id: userId,
        type: 'reject',
      },
    },
    headers: {
      Authorization: `Bearer ${user.access_token}`,
    },
  });
  if (!result) {
    return;
  }

  await bot.editMessageText(`<s>${message.text}</s>\n\nПриглашение отклонено`, {
    chat_id: message.chat.id,
    message_id: message.message_id,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [],
    },
  });
};
