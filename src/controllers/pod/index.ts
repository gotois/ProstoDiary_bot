import type { NextFunction, Request, Response } from 'express';

import { SERVER } from '#env';
import { solidGateway } from '../../app/container.ts';

function getAuthorization(request: Request) {
  const user = request.user;
  if (!user?.actor_id || !request.solidSession) {
    throw new TypeError('Authenticated user is required');
  }
  return {
    webId: user.actor_id,
    fetch: request.solidSession.fetch,
  };
}

/**
 * Инициализирует first-party Pod-контейнер.
 * @param request - HTTP request
 * @param response - HTTP response
 * @param next - Express error handler
 * @returns HTTP response
 */
export async function initializePod(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<Response | void> {
  try {
    return response.status(201).json(await solidGateway.initialize(getAuthorization(request)));
  } catch (error) {
    return next(error);
  }
}

/**
 * Возвращает профиль из first-party Pod.
 * @param request - HTTP request
 * @param response - HTTP response
 * @param next - Express error handler
 * @returns HTTP response
 */
export async function getPodProfile(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<Response | void> {
  try {
    return response.json(await solidGateway.getProfile(getAuthorization(request)));
  } catch (error) {
    return next(error);
  }
}

/**
 * Обновляет профиль в first-party Pod.
 * @param request - HTTP request
 * @param response - HTTP response
 * @param next - Express error handler
 * @returns HTTP response
 */
export async function updatePodProfile(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<Response | void> {
  try {
    const { email, avatar } = request.body as { email?: unknown; avatar?: unknown };
    if (email !== undefined && email !== null && typeof email !== 'string') {
      return response.status(400).send('Invalid email');
    }
    if (avatar !== undefined && avatar !== null && typeof avatar !== 'string') {
      return response.status(400).send('Invalid avatar');
    }
    const profile: { email?: string; avatar?: string } = {};
    if (typeof email === 'string') {
      profile.email = email;
    }
    if (typeof avatar === 'string') {
      profile.avatar = avatar;
    }
    return response.json(await solidGateway.updateProfile(getAuthorization(request), profile));
  } catch (error) {
    return next(error);
  }
}

/**
 * Возвращает ссылки на договоры пользователя.
 * @param request - HTTP request
 * @param response - HTTP response
 * @param next - Express error handler
 * @returns HTTP response
 */
export async function getPodContracts(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<Response | void> {
  try {
    const links = await solidGateway.listContracts(getAuthorization(request));
    return response.json({
      links: links.map((link) => {
        const name = new URL(link).pathname.split('/').at(-1);
        return `${SERVER.HOST}/pod/contracts/${encodeURIComponent(name ?? '')}`;
      }),
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Возвращает договор через BFF, не раскрывая access token браузеру.
 * @param request - HTTP request
 * @param response - HTTP response
 * @param next - Express error handler
 * @returns HTTP response
 */
export async function getPodContract(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<Response | void> {
  try {
    const name = request.params.name;
    if (typeof name !== 'string') {
      return response.status(400).send('Invalid contract resource name');
    }
    const turtle = await solidGateway.getContract(getAuthorization(request), name);
    return response.type('text/turtle').send(turtle);
  } catch (error) {
    return next(error);
  }
}

/**
 * Удаляет договоры пользователя из Pod.
 * @param request - HTTP request
 * @param response - HTTP response
 * @param next - Express error handler
 * @returns HTTP response
 */
export async function deletePodContracts(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<Response | void> {
  try {
    await solidGateway.deleteContracts(getAuthorization(request));
    return response.sendStatus(204);
  } catch (error) {
    return next(error);
  }
}

/**
 * Обновляет iCalendar-ресурс пользователя.
 * @param request - HTTP request
 * @param response - HTTP response
 * @param next - Express error handler
 * @returns HTTP response
 */
export async function updatePodCalendar(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<Response | void> {
  try {
    const { ical } = request.body as { ical?: unknown };
    if (typeof ical !== 'string' || ical.length === 0) {
      return response.status(400).send('Invalid iCalendar');
    }
    await solidGateway.updateCalendar(getAuthorization(request), ical);
    return response.sendStatus(204);
  } catch (error) {
    return next(error);
  }
}
