import { ResponseBodyError } from 'openid-client';
import { container, userRepository } from '../app/container.ts';
import { toUserTokenInput } from '../infrastructure/auth/user-token-input.ts';
import { toLegacyUser } from '../interfaces/user-legacy-view.ts';

/**
 * Загружает пользователя TMA и обновляет истекающий access token.
 * @param request - Express request
 * @param response - Express response
 * @param next - следующий middleware
 */
export default async function (request, response, next) {
  const [scheme, initData] = (request.get('Authorization') ?? '').split(' ', 2);
  if (scheme?.toUpperCase() !== 'TMA' || !initData) {
    response.status(401).send('Unauthorized');
    return;
  }
  const parameters = Object.fromEntries(new URLSearchParams(initData));
  const userParameters = JSON.parse(parameters.user ?? 'null');
  let user = typeof userParameters?.id === 'number' ? container.userRepository.findById(userParameters.id) : undefined;

  if (!user?.accessToken) {
    response.status(401).send('Unauthorized');
    return;
  }

  if (user.expiredAt && user.expiredAt <= Date.now() / 1000 + 60) {
    if (!user.refreshToken || !user.actorId || !user.idToken) {
      response.status(401).send('Unauthorized');
      return;
    }

    try {
      const tokens = await container.refreshUserTokens.execute({ refreshToken: user.refreshToken });
      await container.saveUserTokens.execute(
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
      user = userRepository.findById(user.id);
    } catch (error) {
      console.error('Ошибка обновления токена TMA:', error);
      if (error instanceof ResponseBodyError && error.error === 'invalid_grant') {
        await container.clearUserTokens.execute({ telegramId: user.id });
      }
      response.status(401).send('Unauthorized');
      return;
    }
  }

  if (!user?.accessToken) {
    response.status(401).send('Unauthorized');
    return;
  }
  request.user = toLegacyUser(user);

  next();
}
