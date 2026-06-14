import type { NextFunction, Request, Response } from 'express';
import { SECRETARY } from '#env';

export default async (request: Request, response: Response, next: NextFunction): Promise<Response> => {
  try {
    const res = await fetch(SECRETARY.HOST + '/tasks/subscription', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${request.user?.access_token}`,
      },
    });
    if (!res.ok) {
      throw new Error(`${res.status} Failed to load subscription calendar`)
    }
    const ics = await res.text();
    return response.send(ics);
  } catch (error) {
    next(error);
  }
};
