import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import jsonRpc from 'request-json-rpc2';
import { SECRETARY } from '#env';
import { bot } from './bot.ts';
import { formatTelegramGroupMeeting, getTelegramGroupMeetingReplyMarkup } from '../helpers/telegram-markup.ts';
import { GROUP_ADMIN_STATUSES } from '../helpers/telegram-user-statuses.ts';

export default async (request: Request, response: Response, next: NextFunction): Promise<Response> => {
  try {
    const { remind_before: remindBefore, ...event } = request.body;
    const chatId = request.get('X-Telegram-Chat-Id');
    if (!chatId) {
      return response.status(403).send('Unknown chatId');
    }
    const messageId = request.get('X-Telegram-Message-Id');
    if (!messageId) {
      return response.status(403).send('Unknown messageId');
    }
    if (!event.id_task) {
      return response.status(400).send('Updated event id is missing');
    }
    const chatMember = await bot.getChatMember(chatId, request.user?.id);
    if (!GROUP_ADMIN_STATUSES.has(chatMember.status)) {
      return response.status(403).send('Настраивать встречу могут только админы группы.');
    }
    const tz = request.get('Timezone');

    const rpcResponse = await jsonRpc({
      url: SECRETARY.RPC,
      body: {
        jsonrpc: '2.0',
        id: randomUUID(),
        method: 'edit',
        params: event,
      },
      headers: {
        Authorization: `Bearer ${request.user?.access_token}`,
        Geolocation: request.get('Geolocation'),
        Timezone: tz,
      },
    });
    if (rpcResponse.error) {
      return response.status(400).send('Server error occurred');
    }
    if (typeof remindBefore === 'number' || remindBefore === null) {
      const startDate = new Date(event.start_date);
      const reminderDate = remindBefore === null ? new Date(0) : startDate;
      const remindResponse = await jsonRpc({
        url: SECRETARY.RPC,
        body: {
          jsonrpc: '2.0',
          id: randomUUID(),
          method: 'remind-once',
          params: {
            id_task: event.id_task,
            name: event.name,
            description: event.description,
            year: reminderDate.getFullYear(),
            month: reminderDate.getMonth() + 1,
            day_of_month: reminderDate.getDay(),
            hour: reminderDate.getHours(),
            minute: reminderDate.getMinutes(),
            remind_before: remindBefore === null ? 0 : remindBefore * 60,
          },
        },
        headers: {
          Authorization: `Bearer ${request.user?.access_token}`,
          Geolocation: request.get('Geolocation'),
          Timezone: tz,
        },
      });
      if (remindResponse.error) {
        return response.status(400).send('Unable to set event reminder');
      }
    }

    try {
      await bot.editMessageText(formatTelegramGroupMeeting(event, tz), {
        chat_id: chatId,
        message_id: Number(messageId),
        reply_markup: getTelegramGroupMeetingReplyMarkup({
          chatId,
          messageId,
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

    return response.send('OK');
  } catch (error) {
    next(error);
  }
};
