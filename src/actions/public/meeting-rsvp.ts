import { randomUUID } from 'node:crypto';
import jsonRpc from 'request-json-rpc2';
import { SECRETARY } from '#env';
import { getUser } from '../../models/users.ts';

const RSVP_ANSWERS = {
  yes: 'Готово: иду',
  no: 'Готово: не смогу',
};

export default async function (_activity, message, bot): Promise<void> {
  const [, taskId, status] = message.data.split(':');
  if (status === 'maybe') {
    await bot.answerCallbackQuery(message.id, {
      text: 'Этот вариант пока не поддерживается',
      show_alert: false,
    });
    return;
  }

  const user = getUser(message.from.id);
  if (!user?.access_token) {
    await bot.answerCallbackQuery(message.id, {
      text: 'Сначала авторизуйтесь у бота через /start',
      show_alert: true,
    });
    return;
  }

  try {
    const rpcResponse = await jsonRpc({
      url: SECRETARY.RPC,
      body: {
        jsonrpc: '2.0',
        id: randomUUID(),
        method: 'approval-group',
        params: {
          task_id: Number(taskId),
          type: status === 'yes' ? 'accept' : 'reject',
        },
      },
      headers: {
        Authorization: `Bearer ${user.access_token}`,
      },
    });

    if (rpcResponse.error) {
      throw new Error(rpcResponse.error.message ?? 'Не удалось сохранить ответ');
    }

    await bot.answerCallbackQuery(message.id, {
      text: RSVP_ANSWERS[status] ?? 'Готово',
      show_alert: false,
    });
  } catch (error) {
    console.error(error);
    await bot.answerCallbackQuery(message.id, {
      text: error instanceof Error ? error.message : 'Не удалось сохранить ответ',
      show_alert: true,
    });
  }
}
