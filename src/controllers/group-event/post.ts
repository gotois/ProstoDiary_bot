import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import jsonRpc from 'request-json-rpc2';
import { SECRETARY } from '#env';
import { bot } from '../bot.ts';
import { formatTelegramGroupMeeting } from '../../helpers/telegram-markup.ts';

function getTgGroupId(id: number) {
  return `https://t.me/c/${Math.abs(id)}`;
}

export default async (request: Request, response: Response, next: NextFunction): Promise<Response> => {
  try {
    const { remind_before: remindBefore, target, ...event } = request.body;

    const acct = target?.type === 'Group' ? getTgGroupId(target) : request.user.actor_id;
    if (!acct) {
      return response.status(403).send('Unknown acct');
    }
    const tz = request.get('Timezone');

    const rpcResponse = await jsonRpc({
      url: SECRETARY.RPC,
      body: {
        jsonrpc: '2.0',
        id: randomUUID(),
        method: 'create',
        params: {
          ...event,
        },
      },
      headers: {
        Authorization: `Bearer ${request.user?.access_token}`,
        Geolocation: request.get('Geolocation'),
        Timezone: tz,
      },
    });

    if (rpcResponse.error) {
      return response.status(400).send('Created event id is missing');
    }

    const shareResponse = await jsonRpc({
      url: SECRETARY.RPC,
      body: {
        jsonrpc: '2.0',
        id: randomUUID(),
        method: 'share',
        params: {
          task_id: rpcResponse.result?.id_task,
          acct: acct,
        },
      },
      headers: {
        Authorization: `Bearer ${request.user?.access_token}`,
        Geolocation: request.get('Geolocation'),
        Timezone: tz,
      },
    });
    if (shareResponse.error) {
      return response.status(400).send('Unable to share event with Telegram group');
    }

    if (remindBefore) {
      const reminderDate = new Date(event.start_date);
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
            year: reminderDate.getFullYear(),
            month: reminderDate.getMonth() + 1,
            day_of_month: reminderDate.getDate(),
            hour: reminderDate.getHours(),
            minute: reminderDate.getMinutes(),
            remind_before: remindBefore * 60,
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

    if (target?.id) {
      await bot.sendMessage(target.id, formatTelegramGroupMeeting(rpcResponse.result, tz), {
        parse_mode: 'HTML',
      });
    }

    return response.send('OK');
  } catch (error) {
    next(error);
  }
};
