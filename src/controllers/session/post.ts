import { promisify } from 'node:util';
import { createSolidTokenVerifier, type RequestMethod } from '@solid/access-token-verifier';
import type { Request, Response } from 'express';

import { SERVER } from '#env';
import type { User } from '../../domain/entities/user.ts';

const verifyAccessToken = createSolidTokenVerifier();

type SessionControllerDependencies = {
  verifyToken?: typeof verifyAccessToken;
  findUserByActorId: (actorId: string) => User | undefined;
  serverUrl?: string;
};

/**
 * Создаёт BFF-сессию по DPoP-токену браузерного приложения
 * @param dependencies - Зависимости контроллера
 * @returns Express controller
 */
export function createSessionController(dependencies: SessionControllerDependencies) {
  const verifyToken = dependencies.verifyToken ?? verifyAccessToken;
  const findUserByActorId = dependencies.findUserByActorId;
  const serverUrl = dependencies.serverUrl ?? SERVER.HOST;

  return async function createSession(request: Request, response: Response): Promise<Response> {
    const authorization = request.get('Authorization');
    const dpop = request.get('DPoP');
    if (!authorization || !dpop) {
      return response.status(401).send('Unauthorized');
    }

    try {
      const { webid } = await verifyToken(authorization, {
        header: dpop,
        method: request.method as RequestMethod,
        url: new URL(request.originalUrl, serverUrl).toString(),
      });
      const user = findUserByActorId(webid);
      if (!user?.accessToken) {
        return response.status(404).send('User not found');
      }

      await promisify(request.session.regenerate.bind(request.session))();
      request.session.telegram_id = user.id;
      request.session.token_type = 'Bearer';
      request.session.save();

      return response.sendStatus(204);
    } catch (error) {
      console.error('Ssession bootstrap failed:', error);
      return response.status(401).send('Unauthorized');
    }
  };
}
