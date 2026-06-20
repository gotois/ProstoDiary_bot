import type { NextFunction, Request, Response } from 'express';
import { bot } from '../bot.ts';
import { getGroups } from '../../models/groups.ts';

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
    const query = typeof request.query.query === 'string' ? request.query.query.trim().toLocaleLowerCase() : '';

    for (const group of getGroups()) {
      try {
        const member = await bot.getChatMember(group.id, request.user?.id);
        if (!ACTIVE_GROUP_STATUSES.has(member.status)) {
          continue;
        }

        const chat = await bot.getChat(group.id);
        const title = chat.title ?? String(chat.id);
        if (query && !title.toLocaleLowerCase().includes(query)) {
          continue;
        }

        groups.push({
          id: chat.id,
          title,
          type: chat.type,
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
