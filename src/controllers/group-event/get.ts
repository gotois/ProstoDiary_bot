import type { NextFunction, Request, Response } from 'express';
import { container, telegramEventRepository } from '../../app/container.ts';

export default async (
  request: Request<{ taskId: string }>,
  response: Response,
  next: NextFunction,
): Promise<Response> => {
  try {
    const taskResponse = await container.getTask.execute({
      taskId: request.params.taskId,
      accessToken: request.user.access_token,
    });
    if (!taskResponse.data) {
      return response.status(taskResponse.status).send('Unable to load task');
    }

    const taskId = Number(request.params.taskId);
    const telegramEvent = telegramEventRepository.getTelegramEventByTaskId(taskId);
    if (!telegramEvent) return response.json(taskResponse.data);

    return response.json({
      ...(taskResponse.data as Record<string, unknown>),
      chatId: telegramEvent.chatId,
      messageId: telegramEvent.messageId,
      targetName: telegramEvent.name,
      targetType: telegramEvent.type,
    });
  } catch (error) {
    next(error);
  }
};
