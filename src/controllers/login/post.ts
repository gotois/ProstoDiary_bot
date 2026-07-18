import { promisify } from 'node:util';
import type { Request, Response } from 'express';

import { SECRETARY } from '#env';
import { container } from '../../app/container.ts';
import { getTmaUserId } from '../../middleware/get-user.ts';

export default async function postLogin(request: Request, response: Response): Promise<void> {
  try {
    const issuer =
      typeof request.body?.oidcIssuer === 'string' && request.body.oidcIssuer.length > 0
        ? request.body.oidcIssuer
        : SECRETARY.HOST;
    const initData =
      typeof request.body?.initData === 'string' && request.body.initData.length > 0
        ? request.body.initData
        : undefined;
    const telegramId = initData ? getTmaUserId(initData) : undefined;
    if (initData && telegramId === undefined) {
      response.status(401).send('Invalid Telegram init data');
      return;
    }

    request.session.oauth_pending = true;
    await promisify(request.session.save.bind(request.session))();
    const authorizationUrl = await container.solidSessions.startAuthorization({
      issuer,
      bffSessionId: request.sessionID,
      isTma: initData !== undefined,
      initData,
      telegramId,
    });
    console.log('Solid OAuth authorization initialized', {
      issuer: new URL(issuer).origin,
      isTma: initData !== undefined,
    });
    response.redirect(303, authorizationUrl);
  } catch (error) {
    console.error('Unable to start Solid authorization:', error);
    response.status(400).send('Произошла ошибка авторизации клиента');
  }
}
