import type { NextFunction, Request, Response } from 'express';
import { secretaryGateway, telegramEventRepository } from '../../app/container.ts';

export default async (
  request: Request<{ taskId: string }>,
  response: Response,
  next: NextFunction,
): Promise<Response> => {
  try {
    const data = await secretaryGateway.getTask({
      taskId: request.params.taskId,
      accessToken: request.user.access_token,
    });

    const taskId = Number(request.params.taskId);
    const telegramEvent = telegramEventRepository.getTelegramEventByTaskId(taskId);
    if (!telegramEvent) return response.json(data);

    return response.json({
      ...(data as Record<string, unknown>),
      chatId: telegramEvent.chatId,
      messageId: telegramEvent.messageId,
      targetName: telegramEvent.name,
      targetType: telegramEvent.type,
    });
  } catch (error) {
    next(error);
  }
};
