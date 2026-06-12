import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import jsonRpc from 'request-json-rpc2';
import { SECRETARY } from '#env';
import { bot } from './bot.ts';
import {
  formatTelegramGroupMeeting,
  getTelegramGroupMeetingReplyMarkup,
  getTelegramMessageUrl,
} from '../helpers/telegram-markup.ts';
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
    const chatMember = await bot.getChatMember(chatId, request.user?.id);
    if (!GROUP_ADMIN_STATUSES.has(chatMember.status)) {
      return response.status(403).send('Настраивать встречу могут только админы группы.');
    }
    const chat = await bot.getChat(chatId);
    const target = getTelegramMessageUrl({
      chat,
      messageId,
    });

    const rpcResponse = await jsonRpc({
      url: SECRETARY.RPC,
      body: {
        jsonrpc: '2.0',
        id: randomUUID(),
        method: 'create',
        params: {
          ...event,
          target,
        },
      },
      headers: {
        Authorization: `Bearer ${request.user?.access_token}`,
        Geolocation: request.get('Geolocation'),
      },
    });

    if (rpcResponse.error) {
      return response.status(400).send('Created event id is missing');
    }

    if (typeof remindBefore === 'number') {
      const startDate = new Date(event.start_date);
      const remindResponse = await jsonRpc({
        url: SECRETARY.RPC,
        body: {
          jsonrpc: '2.0',
          id: randomUUID(),
          method: 'remind-once',
          params: {
            id_task: rpcResponse.result?.id_task,
            name: event.name,
            description: event.description,
            year: startDate.getUTCFullYear(),
            month: startDate.getUTCMonth() + 1,
            day_of_month: startDate.getUTCDate(),
            hour: startDate.getUTCHours(),
            minute: startDate.getUTCMinutes(),
            remind_before: remindBefore * 60,
          },
        },
        headers: {
          Authorization: `Bearer ${request.user?.access_token}`,
          Geolocation: request.get('Geolocation'),
        },
      });
      if (remindResponse.error) {
        return response.status(400).send('Unable to set event reminder');
      }
    }

    await bot.editMessageText(formatTelegramGroupMeeting(event), {
      chat_id: chatId,
      message_id: Number(messageId),
      reply_markup: getTelegramGroupMeetingReplyMarkup({
        chatId,
        messageId,
        taskId: rpcResponse.result?.id_task,
      }),
    });

    return response.send('OK');
  } catch (error) {
    next(error);
  }
};
