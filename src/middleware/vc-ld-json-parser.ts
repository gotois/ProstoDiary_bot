import type { Request, Response, NextFunction } from 'express';
import { json } from 'node:stream/consumers';

/**
 * Парсим тело запроса с Content-Type application/vc+ld+json
 * @param {Request} request - request
 * @param {Response} response - response
 * @param {NextFunction} next - next
 * @returns {Promise<void>} Результат разбора тела запроса
 */
export default async function (request: Request, response: Response, next: NextFunction): Promise<void> {
  const rawContentType = request?.headers['content-type'] ?? request?.get('content-type') ?? '';
  const [contentType] = rawContentType.split(';');

  if (contentType.trim().toLowerCase() !== 'application/vc+ld+json') {
    return next();
  }

  try {
    const bodyObject = await json(request);
    request.body = bodyObject ?? {};
    next();
  } catch (error) {
    console.error('Не удалось использовать node:stream/consumers:', error?.message || error);
    next(error);
  }
}
