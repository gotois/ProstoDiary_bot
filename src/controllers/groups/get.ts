import type { NextFunction, Request, Response } from 'express';
import { bot } from '../../interfaces/bot.ts';
import { groupRepository } from '../../app/container.ts';

const ACTIVE_GROUP_STATUSES = new Set(['creator', 'administrator', 'member', 'restricted']);

/**
 * @todo TODO: Если для формы будет общий endpoint target, сохранить здесь только группу, а контакты tg вынести в отдельный контроллер или сервис по текущему паттерну
 * @description Возвращает Telegram группы, доступные текущему пользователю TMA
 * @param {Request} request - Express request
 * @param {Response} response - Express response
 * @param {NextFunction} next - следующий middleware
 * @returns {Promise<Response>} HTTP response
 */
export default async function getGroupsController(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<Response> {
  try {
    const groups = [];
    const { query = '' } = request.query;
    if (query?.length === 0) {
      return response.json(groups);
    }

    for (const group of groupRepository.findByTitle(String(query))) {
      try {
        const member = await bot.getChatMember(group.id, request.user?.id);
        if (!ACTIVE_GROUP_STATUSES.has(member.status)) {
          continue;
        }

        groups.push({
          id: group.id,
          title: group.title,
        });
      } catch (error) {
        console.warn('Unable to load Telegram group', group.id, error);
      }
    }

    return response.json(groups);
  } catch (error) {
    next(error);
  }
}
