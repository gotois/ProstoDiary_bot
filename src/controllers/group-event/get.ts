import type { NextFunction, Request, Response } from 'express';
import { container } from '../../app/container.ts';

export default async (
  request: Request<{ taskId: string }>,
  response: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const taskResponse = await container.getTask.execute({
      taskId: request.params.taskId,
      accessToken: request.user.access_token,
    });
    if (!taskResponse.data) return response.status(taskResponse.status).send('Unable to load task');

    // TODO: Найти task_id в groupDB.telegram_events и добавить chatId/messageId к JSON-ответу.
    // Фронтенд сможет редактировать и удалять событие, открытое из календаря, без route.query.
    return response.json(taskResponse.data);
  } catch (error) {
    next(error);
  }
};
