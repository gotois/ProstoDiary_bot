import type { NextFunction, Request, Response } from 'express';
import { secretaryGateway } from '../../app/container.ts';

/**
 * @description Ищет события текущего пользователя по названию
 * @param {Request} request - Express request
 * @param {Response} response - Express response
 * @param {NextFunction} next - следующий middleware
 * @returns {Promise<Response>} HTTP response
 */
export default async (request: Request, response: Response, next: NextFunction): Promise<Response> => {
  try {
    const { query = '', limit = 5 } = request.query;

    const events = await secretaryGateway.queryEvents({
      query: String(query),
      limit: Number(limit),
      accessToken: request.user?.access_token,
    });

    return response.json(events);
  } catch (error) {
    next(error);
  }
};
