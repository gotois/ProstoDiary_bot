const { buildAuthorizationUrlWithPAR } = require('openid-client');
const { getAuthorization } = require('../libs/oidc-client.cjs');

module.exports = async (request, response) => {
  try {
    const { client, codeVerifier, parameters } = await getAuthorization(); // ← добавить codeVerifier
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
