import { buildAuthorizationUrlWithPAR } from 'openid-client';
import { getAuthorization } from '../libs/oidc-client.ts';

export default async (request, response) => {
  try {
    const { client, codeVerifier, parameters } = await getAuthorization();
    request.session.code_verifier = codeVerifier;
    request.session.state = parameters.state;
    await request.session.save();

    const { initData } = request.body;
    const authorizationUrl = await buildAuthorizationUrlWithPAR(client, {
      ...parameters,
      tma_init_data: initData,
    });
    return response.json({ url: authorizationUrl.toString() });
  } catch (error) {
    console.error(error);
    response.status(400).send('Произошла ошибка авторизации клиента');
  }
};
