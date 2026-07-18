import { promisify } from 'node:util';
import type { Request, Response } from 'express';

export default async function deleteSession(request: Request, response: Response): Promise<Response> {
  await promisify(request.session.destroy.bind(request.session))();
  return response.sendStatus(204);
}
