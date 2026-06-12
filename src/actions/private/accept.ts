import { randomUUID } from 'node:crypto';
import jsonRpc from 'request-json-rpc2';
import { SECRETARY } from '#env';
import { getUser } from '../../models/users.ts';

export default async (activity, message, bot) => {
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
