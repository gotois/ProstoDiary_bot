import type { Configuration } from 'openid-client';
import { randomPKCECodeVerifier, calculatePKCECodeChallenge, randomState, discovery } from 'openid-client';
import env from '../environments/index.ts';

const { SECRETARY, OIDC } = env;

let client: Configuration | undefined;

export async function getAuthorization() {
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

export async function getClient(): Promise<Configuration> {
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
