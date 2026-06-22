import type { NextFunction, Request, Response } from 'express';
import { taskGateway } from '../../app/container.ts';
import { bot } from '../../interfaces/telegram/bot.ts';
import { GROUP_ADMIN_STATUSES } from '../../helpers/telegram-user-statuses.ts';

export default async (request: Request, response: Response, next: NextFunction): Promise<Response> => {
  try {
    if (!request.body.chatId) {
      return response.status(403).send('Unknown group');
    }
    if (!request.body.ids) {
      return response.status(400).send('Updated event id is missing');
    }
    const chatMember = await bot.getChatMember(request.body.chatId, request.user?.id);
    if (!GROUP_ADMIN_STATUSES.has(chatMember.status)) {
      return response.status(403).send('Настраивать встречу могут только админы группы.');
    }

    const rpcResponse = await taskGateway.call({
      method: 'edit',
      params: { ids: request.body.ids },
      accessToken: request.user?.access_token,
      geolocation: request.get('Geolocation'),
    });
    if (rpcResponse.error) {
      return response.status(400).send('Created event id is missing');
    }

    return response.send('OK');
  } catch (error) {
    next(error);
  }
};
