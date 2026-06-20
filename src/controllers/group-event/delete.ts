import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import jsonRpc from 'request-json-rpc2';
import { SECRETARY } from '#env';
import { bot } from '../bot.ts';
import { GROUP_ADMIN_STATUSES } from '../../helpers/telegram-user-statuses.ts';

export default async (request: Request, response: Response, next: NextFunction): Promise<Response> => {
  try {
    if (!request.body.group) {
      return response.status(403).send('Unknown group');
    }
    if (!request.body.ids) {
      return response.status(400).send('Updated event id is missing');
    }
    const chatMember = await bot.getChatMember(request.body.group, request.user?.id);
    if (!GROUP_ADMIN_STATUSES.has(chatMember.status)) {
      return response.status(403).send('Настраивать встречу могут только админы группы.');
    }

    const rpcResponse = await jsonRpc({
      url: SECRETARY.RPC,
      body: {
        jsonrpc: '2.0',
        id: randomUUID(),
        method: 'edit',
        params: {
          ids: request.body.ids,
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

    return response.send('OK');
  } catch (error) {
    next(error);
  }
};
