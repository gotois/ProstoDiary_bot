import type { Request, Response } from 'express';

import { SERVER } from '#env';
import { container } from '../../app/container.ts';
import {
  SolidAuthorizationRequiredError,
  type ActiveSolidAuthorization,
} from '../../infrastructure/solid/solid-session-manager.ts';
import { getTmaUserId } from '../../middleware/get-user.ts';

/**
 * Возвращает единый ответ для отсутствующей BFF/TMA-авторизации.
 * @param response - Express response
 * @returns Ответ с требованием авторизации
 */
function authenticationRequired(response: Response): Response {
  return response.status(401).json({
    error: 'authentication_required',
    loginUrl: `${SERVER.HOST}/login`,
  });
}

export default async function getSession(request: Request, response: Response): Promise<Response> {
  const authorizationId = request.session.authorization_id;
  const [scheme, initData] = (request.get('Authorization') ?? '').split(' ', 2);
  const isTmaRequest = scheme?.toUpperCase() === 'TMA';

  try {
    let active: ActiveSolidAuthorization;
    if (isTmaRequest) {
      const telegramId = initData ? getTmaUserId(initData) : undefined;
      if (telegramId === undefined) {
        return authenticationRequired(response);
      }
      active = await container.solidSessions.getByTelegramId(telegramId);
      request.session.authorization_id = active.authorization.id;
      request.session.telegram_id = telegramId;
    } else {
      if (typeof authorizationId !== 'string') {
        return authenticationRequired(response);
      }
      active = await container.solidSessions.getById(authorizationId);
    }
    request.session.token_type = active.authorization.tokenType;
    return response.json({
      authenticated: true,
      user: { webId: active.authorization.webId },
    });
  } catch (error) {
    if (error instanceof SolidAuthorizationRequiredError) {
      return authenticationRequired(response);
    }
    console.error('BFF session refresh failed:', error);
    return response.status(503).json({ error: 'authorization_refresh_failed' });
  }
}
