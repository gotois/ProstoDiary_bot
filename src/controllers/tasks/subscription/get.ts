import type { NextFunction, Request, Response } from 'express';
import { SECRETARY } from '#env';

export default async (request: Request, response: Response, next: NextFunction): Promise<Response> => {
  try {
    const result = await fetch(SECRETARY.HOST + '/tasks/subscription', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${request.user?.access_token}`,
      },
    });
    if (!result.ok) {
      return response.status(result.status).send('Failed to load subscription calendar');
    }
    const ics = await result.text();
    return response.send(ics);
  } catch (error) {
    next(error);
  }
};
