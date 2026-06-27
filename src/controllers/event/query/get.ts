import type { NextFunction, Request, Response } from 'express';
import { secretaryGateway } from '../../../app/container.ts';

/**
 * @description Ищет события текущего пользователя по названию
 * @param {Request} request - Express request
 * @param {Response} response - Express response
 * @param {NextFunction} next - следующий middleware
 * @returns {Promise<Response>} HTTP response
 */
export default async (request: Request, response: Response, next: NextFunction): Promise<Response> => {
  try {
    if (!request.user) {
      throw new Error('User not found');
    }

    const query = typeof request.query.query === 'string' ? request.query.query : '';
    const limit = typeof request.query.limit === 'string' ? Number(request.query.limit) : 5;
    const events = await secretaryGateway.queryEvents({
      query,
      limit,
      accessToken: request.user.access_token,
    });

    return response.json(events);
  } catch (error) {
    next(error);
  }
};
