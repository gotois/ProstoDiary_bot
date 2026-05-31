import type { Request, Response, NextFunction } from 'express';
import { json } from 'node:stream/consumers';

export default async function (request: Request, response: Response, next: NextFunction): Promise<void> {
  const rawContentType = request?.headers['content-type'] ?? request?.get('content-type') ?? '';
  const contentType = String(rawContentType).split(';')[0].trim().toLowerCase();

  if (contentType !== 'application/vc+ld+json') {
    return next();
  }

  try {
    const bodyObject = await json(request);
    request.body = bodyObject ?? {};
    next();
  } catch (error) {
    console.error('Не удалось использовать node:stream/consumers:', error && error.message ? error.message : error);
    next(error);
  }
}
