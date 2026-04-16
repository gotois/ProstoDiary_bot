const { randomPKCECodeVerifier, calculatePKCECodeChallenge, randomState, discovery } = require('openid-client');
const { SECRETARY, OIDC } = require('../environments/index.cjs');

let client;

/**
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

/**
 *
 * @returns {Promise<import('openid-client').Configuration>}
 */
async function getClient() {
  if (client) {
    return client;
  }
  client = await discovery(new URL(SECRETARY.HOST), OIDC.CLIENT_ID, {
    client_secret: OIDC.CLIENT_SECRET,
    redirect_uris: [OIDC.CLIENT_REDIRECT],
    response_types: ['code'],
    token_endpoint_auth_method: 'client_secret_basic',
  });
  return client;
}

module.exports = {
  getAuthorization,
  getClient,
};
