import type { NextFunction, Request, Response } from 'express';
import { bot } from '../../interfaces/bot.ts';
import { groupRepository } from '../../app/container.ts';

const ACTIVE_GROUP_STATUSES = new Set(['creator', 'administrator', 'member', 'restricted']);

/**
 * @description Возвращает Telegram группы, доступные текущему пользователю TMA
 * @param request - Express request
 * @param response - Express response
 * @param next - следующий middleware
 */
export default async function getGroupsController(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // TODO: Если для формы будет общий endpoint target, сохранить здесь только группу,
    // а контакты tg вынести в отдельный контроллер или сервис по текущему паттерну.
    const groups = [];

    const query = typeof request.query.query === 'string' ? request.query.query : '';
    for (const group of groupRepository.findByTitle(query)) {
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

    response.json(groups);
  } catch (error) {
    next(error);
  }
}
