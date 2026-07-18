import type { Request, Response } from 'express';
import { promisify } from 'node:util';
import { container } from '../../app/container.ts';

export default async (request: Request, response: Response): Promise<Response> => {
  try {
    const authorization = await container.oidc.startAuthorization({ initData: request.body.initData });
    request.session.code_verifier = authorization.codeVerifier;
    request.session.state = authorization.state;
    await promisify(request.session.save.bind(request.session))();

    return response.json({ url: authorization.url });
  } catch (error) {
    console.error(error);
    response.status(400).send('Произошла ошибка авторизации клиента');
  }
};
