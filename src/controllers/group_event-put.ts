import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import jsonRpc from 'request-json-rpc2';
import { IS_DEV, SECRETARY, TELEGRAM } from '#env';
import { bot } from './bot.ts';
import { formatTelegramGroupMeeting, getTelegramGroupMeetingReplyMarkup } from '../libs/group-event-message.ts';

const GROUP_ADMIN_STATUSES = new Set(['creator', 'administrator']);

export default async (request: Request, response: Response, next: NextFunction): Promise<Response> => {
  try {
    const chatId = request.get('X-Telegram-Chat-Id');
    const messageId = request.get('X-Telegram-Message-Id');

    if (!chatId) {
      return response.status(403).send('Unknown chatId');
    }
    if (!messageId) {
      return response.status(403).send('Unknown messageId');
    }
    const taskId = request.body.id_task;
    if (!taskId) {
      throw new TypeError('Updated event id is missing');
    }
    const chatMember = await bot.getChatMember(chatId, request.user.id);
    if (!GROUP_ADMIN_STATUSES.has(chatMember.status)) {
      return response.status(403).send('Настраивать встречу могут только админы группы.');
    }

    await jsonRpc({
      url: SECRETARY.RPC,
      body: {
        jsonrpc: '2.0',
        id: randomUUID(),
        method: 'edit',
        params: request.body,
      },
      headers: {
        Authorization: `Bearer ${request.user.access_token}`,
      },
    });

    await bot.editMessageText(formatTelegramGroupMeeting(request.body), {
      chat_id: chatId,
      message_id: Number(messageId),
      reply_markup: getTelegramGroupMeetingReplyMarkup({
        botLink: TELEGRAM.BOT_LINK,
        chatId,
        debug: IS_DEV,
        messageId,
        taskId,
      }),
    });

    return response.send('OK');
  } catch (error) {
    next(error);
  }
};
