import { ResponseBodyError } from 'openid-client';
import { container, userRepository } from '../app/container.ts';
import { toUserTokenInput } from '../infrastructure/auth/user-token-input.ts';
import type { Request, Response, NextFunction } from 'express';

/**
 * @description Проверяет TMA авторизацию и добавляет пользователя в request
 * @param {Request} request - Express request
 * @param {Response} response - Express response
 * @param {NextFunction} next - следующий middleware
 * @returns HTTP response или переход к следующему middleware
 */
export default async function (request: Request, response: Response, next: NextFunction): Promise<Response> {
  const sessionTelegramId = request.session.telegram_id;
  let user = typeof sessionTelegramId === 'number' ? userRepository.findById(sessionTelegramId) : undefined;

  if (!user) {
    const [scheme, initData] = (request.get('Authorization') ?? '').split(' ', 2);
    if (scheme?.toUpperCase() !== 'TMA' || !initData) {
      return response.status(401).send('Unauthorized');
    }
    const parameters = Object.fromEntries(new URLSearchParams(initData));
    const userParameters = JSON.parse(parameters.user ?? 'null');
    user = typeof userParameters?.id === 'number' ? userRepository.findById(userParameters.id) : undefined;
  }

  if (!user) {
    return response.status(404).send('User not found');
  }
  if (!user?.accessToken) {
    return response.status(401).send('Unauthorized');
  }

  if (user.expiredAt && user.expiredAt <= Date.now() / 1000 + 60) {
    if (!user.refreshToken || !user.actorId || !user.idToken) {
      return response.status(401).send('Unauthorized');
    }

    try {
      const tokens = await container.oidc.refreshTokens(user.refreshToken);
      container.user.saveUserTokens(
        toUserTokenInput({
          telegramId: user.id,
          actorId: user.actorId,
          tokens: {
            access_token: tokens.accessToken,
            id_token: tokens.idToken ?? user.idToken,
            refresh_token: tokens.refreshToken ?? user.refreshToken,
          },
        }),
      );
      if (request.session.telegram_id) {
        request.session.token_type = tokens.tokenType;
      }
      user = userRepository.findById(user.id);
    } catch (error) {
      console.error('Ошибка обновления токена TMA:', error);
      if (error instanceof ResponseBodyError && error.error === 'invalid_grant') {
        container.user.clearUserTokens({ telegramId: user.id });
      }
      return response.status(401).send('Unauthorized');
    }
  }

  if (!user?.accessToken) {
    return response.status(401).send('Unauthorized');
  }
  request.user = {
    id: user.id,
    actor_id: user.actorId,
    location: user.location,
    language: user.language,
    timezone: user.timezone,
    access_token: user.accessToken,
    id_token: user.idToken,
    refresh_token: user.refreshToken,
    token_type: request.session.token_type ?? 'Bearer',
    created_at: user.createdAt,
    expired_at: user.expiredAt,
  };

  next();
}
