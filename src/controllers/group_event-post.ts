import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import jsonRpc from 'request-json-rpc2';
import { SECRETARY, TELEGRAM, IS_DEV } from '#env';
import { bot } from './bot.ts';

const GROUP_ADMIN_STATUSES = new Set(['creator', 'administrator']);

/**
 *
 * @param value
 */
function formatMeetingDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return new Intl.DateTimeFormat('ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  }).format(date);
}

/**
 *
 * @param value
 */
function formatMeetingTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 *
 * @param data
 */
function formatTelegramGroupMeeting(data: any) {
  const title = data.title || data.name || 'Встреча';
  const lines = [`🍻 ${title}`, ''];
  const date = formatMeetingDate(data.start_date);
  const time = formatMeetingTime(data.start_date);
  if (date) {
    lines.push(`📅 ${date}`);
  }
  if (time) {
    lines.push(`🕖 ${time}`);
  }
  if (data.location) {
    lines.push(`📍 ${data.location}`);
  }
  if (data.description) {
    lines.push('', data.description);
  }
  return lines.join('\n');
}

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
    const chatMember = await bot.getChatMember(chatId, request.user.id);
    if (!GROUP_ADMIN_STATUSES.has(chatMember.status)) {
      return response.status(403).send('Настраивать встречу могут только админы группы.');
    }

    const rpcResponse = await jsonRpc({
      url: SECRETARY.RPC,
      body: {
        jsonrpc: '2.0',
        id: randomUUID(),
        method: 'create',
        params: request.body,
      },
      headers: {
        Authorization: `Bearer ${request.user.access_token}`,
        Geolocation: request.get('Geolocation'),
      },
    });

    const taskId = (rpcResponse.result as unknown as { id_task?: number }).id_task;
    if (!taskId) {
      throw new TypeError('Created event id is missing');
    }

    const to = new URLSearchParams({
      tgGroupChatId: chatId,
      tgGroupMessageId: messageId,
    });
    const payload = Buffer.from(
      JSON.stringify({
        debug: IS_DEV,
        to: `/calendar/${taskId}/edit?${to.toString()}`,
      }),
    ).toString('base64url');

    await bot.editMessageText(formatTelegramGroupMeeting(request.body), {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Иду',
              callback_data: 'meeting_rsvp:yes',
            },
            {
              text: 'Не иду',
              callback_data: 'meeting_rsvp:no',
            },
          ],
          [
            {
              text: 'Возможно иду',
              callback_data: 'meeting_rsvp:maybe',
            },
          ],
          [
            {
              text: '📅 Редактировать событие',
              url: `${TELEGRAM.BOT_LINK}?startapp=${payload}`,
            },
          ],
        ],
      },
    });

    return response.send('OK');
  } catch (error) {
    next(error);
  }
};
