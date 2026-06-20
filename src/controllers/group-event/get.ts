import type { NextFunction, Request, Response } from 'express';
import { SECRETARY } from '#env';

export default async (
  request: Request<{ taskId: string }>,
  response: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const taskResponse = await fetch(`${SECRETARY.HOST}/tasks/${encodeURIComponent(request.params.taskId)}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${request.user?.access_token}`,
      },
    });

    if (!taskResponse.ok) {
      return response.status(taskResponse.status).send('Unable to load task');
    }

    return response.json(await taskResponse.json());
  } catch (error) {
    next(error);
  }
};
