import type { Request, Response } from 'express';

export default (request: Request, response: Response): Response => {
  return response.send('Pong');
};
