import { getUser } from '../models/users.ts';

/**
 * Возвращает пользователя из Telegram Mini App init data
 * @param authorization - заголовок Authorization с Telegram Mini App init data
 * @returns Пользователь Telegram с сохранёнными токенами
 */
export const getUserByTmaAuthorization = (authorization: string) => {
  const [scheme, initData] = authorization.split(' ', 2);
  if (scheme?.toUpperCase() !== 'TMA' || !initData) {
    return;
  }

  try {
    const parameters = Object.fromEntries(new URLSearchParams(initData));
    const user = JSON.parse(parameters.user ?? 'null');
    return typeof user?.id === 'number' ? getUser(user.id) : undefined;
  } catch {
    return;
  }
};

export default function (request, response, next) {
  const user = getUserByTmaAuthorization(request.get('Authorization') ?? '');
  if (!user?.access_token) {
    response.status(401).send('Unauthorized');
    return;
  }
  request.user = user;

  next();
}
