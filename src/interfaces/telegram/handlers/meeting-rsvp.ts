import { taskGateway, userRepository } from '../../../app/container.ts';

const ANSWERS = {
  accept: 'Готово: иду',
  reject: 'Готово: не смогу',
};

/**
 *
 * @param _activity
 * @param message
 * @param bot
 */
export default async function (_activity, message, bot): Promise<void> {
  const [, taskId, type] = message.data.split(':');

  const user = userRepository.findById(message.from.id);
  if (!user?.accessToken) {
    await bot.answerCallbackQuery(message.id, {
      text: 'Сначала авторизуйтесь у бота через /start',
      show_alert: true,
    });
    return;
  }

  try {
    const rpcResponse = await taskGateway.call({
      method: 'approval',
      params: { task_id: Number(taskId), type },
      accessToken: user.accessToken,
    });

    if (rpcResponse.error) {
      throw new Error(rpcResponse.error.message ?? 'Не удалось сохранить ответ');
    }

    await bot.answerCallbackQuery(message.id, {
      text: ANSWERS[type] ?? 'Готово',
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
