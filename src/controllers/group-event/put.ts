import type { NextFunction, Request, Response } from 'express';
import { taskGateway } from '../../app/container.ts';
import { bot } from '../../interfaces/telegram/bot.ts';
import { formatTelegramGroupMeeting, getTelegramGroupMeetingReplyMarkup } from '../../helpers/telegram-markup.ts';
import { GROUP_ADMIN_STATUSES } from '../../helpers/telegram-user-statuses.ts';

export default async (request: Request, response: Response, next: NextFunction): Promise<Response> => {
  try {
    const { remind_before: remindBefore, target, messageId, ...event } = request.body;
    if (!event.id_task) {
      return response.status(400).send('Updated event id is missing');
    }
    const tz = request.get('Timezone');

    const rpcResponse = await taskGateway.call({
      method: 'edit',
      params: event,
      accessToken: request.user?.access_token,
      geolocation: request.get('Geolocation'),
      timezone: tz,
    });
    if (rpcResponse.error) {
      return response.status(400).send('Server error occurred');
    }
    if (remindBefore === 'number' || remindBefore === null) {
      const startDate = new Date(event.start_date);
      const reminderDate = remindBefore === null ? new Date(0) : startDate;
      const remindResponse = await taskGateway.call({
        method: 'remind-once',
        params: {
          id_task: event.id_task,
          name: event.name,
          description: event.description,
          year: reminderDate.getFullYear(),
          month: reminderDate.getMonth() + 1,
          day_of_month: reminderDate.getDate(),
          hour: reminderDate.getHours(),
          minute: reminderDate.getMinutes(),
          remind_before: remindBefore === null ? 0 : remindBefore * 60,
        },
        accessToken: request.user?.access_token,
        geolocation: request.get('Geolocation'),
        timezone: tz,
      });
      if (remindResponse.error) {
        return response.status(400).send('Unable to set event reminder');
      }
    }

    for (const t of target) {
      if (t.type === 'Group') {
        const chatMember = await bot.getChatMember(t.id, request.user?.id);
        if (!GROUP_ADMIN_STATUSES.has(chatMember.status)) {
          return response.status(403).send('Настраивать встречу могут только админы группы.');
        }
        if (t.messageId) {
          try {
            await bot.editMessageText(formatTelegramGroupMeeting(event, tz), {
              chat_id: t.id,
              message_id: t.messageId,
              reply_markup: getTelegramGroupMeetingReplyMarkup({
                chatId: t.id,
                messageId: t.messageId,
                taskId: rpcResponse.result?.id_task,
              }),
            });
          } catch (error) {
            const isMessageNotModified =
              error instanceof Error &&
              'code' in error &&
              error.code === 'ETELEGRAM' &&
              error.message.includes('message is not modified');

            if (!isMessageNotModified) {
              throw error;
            }
          }
        }
      }
    }

    return response.send('OK');
  } catch (error) {
    next(error);
  }
};
