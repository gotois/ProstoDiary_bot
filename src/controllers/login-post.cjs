const {
  buildAuthorizationUrlWithPAR,
  randomPKCECodeVerifier,
  calculatePKCECodeChallenge,
  randomState,
} = require('openid-client');
const { OIDC } = require('../environments/index.cjs');
const getClient = require('../oidc-client.cjs');

/**
 * // todo - копипаст
 * @returns {object}
 */
async function getAuthorization() {
  const client = await getClient();
  const codeVerifier = randomPKCECodeVerifier();
  const codeChallenge = await calculatePKCECodeChallenge(codeVerifier);
  const state = randomState();

  return {
    client,
    codeVerifier,
    parameters: {
      scope: 'openid profile',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state,
      redirect_uri: OIDC.CLIENT_REDIRECT,
    },
  };
}

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
