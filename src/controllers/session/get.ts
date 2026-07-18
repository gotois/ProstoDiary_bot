import type { Request, Response } from 'express';

import { SERVER } from '#env';
import { container } from '../../app/container.ts';
import { SolidAuthorizationRequiredError } from '../../infrastructure/solid/solid-session-manager.ts';

export default async function getSession(request: Request, response: Response): Promise<Response> {
  const authorizationId = request.session.authorization_id;
  if (typeof authorizationId !== 'string') {
    return response.status(401).json({
      error: 'authentication_required',
      loginUrl: `${SERVER.HOST}/login`,
    });
  }

  try {
    const active = await container.solidSessions.getById(authorizationId);
    request.session.token_type = active.authorization.tokenType;
    return response.json({
      authenticated: true,
      user: { webId: active.authorization.webId },
    });
  } catch (error) {
    if (error instanceof SolidAuthorizationRequiredError) {
      return response.status(401).json({
        error: 'authentication_required',
        loginUrl: `${SERVER.HOST}/login`,
      });
    }
    console.error('BFF session refresh failed:', error);
    return response.status(503).json({ error: 'authorization_refresh_failed' });
  }
}
