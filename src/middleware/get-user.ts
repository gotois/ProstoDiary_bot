import { refreshTokenGrant, ResponseBodyError } from 'openid-client';
import { getClient } from '../libs/oidc-client.ts';
import { clearJWT, getUser, setJWT } from '../models/users.ts';

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
  let user = typeof userParameters?.id === 'number' ? getUser(userParameters.id) : undefined;

  if (!user?.access_token) {
    response.status(401).send('Unauthorized');
    return;
  }

  if (user.expired_at && user.expired_at <= Date.now() / 1000 + 60) {
    if (!user.refresh_token || !user.actor_id || !user.id_token) {
      response.status(401).send('Unauthorized');
      return;
    }

    try {
      const client = await getClient();
      const tokens = await refreshTokenGrant(client, user.refresh_token);
      setJWT(user.id, user.actor_id, {
        ...tokens,
        expires_in: tokens.expires_in ?? 0,
        id_token: tokens.id_token ?? user.id_token,
        refresh_token: tokens.refresh_token ?? user.refresh_token,
      });
      user = getUser(user.id);
    } catch (error) {
      console.error('Ошибка обновления токена TMA:', error);
      if (error instanceof ResponseBodyError && error.error === 'invalid_grant') {
        clearJWT(user.id);
      }
      response.status(401).send('Unauthorized');
      return;
    }
  }

  if (!user?.access_token) {
    response.status(401).send('Unauthorized');
    return;
  }
  request.user = user;

  next();
}
