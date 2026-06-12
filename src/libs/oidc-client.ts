import {
  type Configuration,
  randomPKCECodeVerifier,
  calculatePKCECodeChallenge,
  randomState,
  discovery,
} from 'openid-client';
import environment from '../environments/index.ts';

const { SECRETARY, OIDC } = environment;

let client: Configuration | undefined;

/**
 * Создаёт объект параметров авторизации PKCE
 * @returns {Promise<object>} Параметры авторизации с codeVerifier и state
 */
export async function getAuthorization() {
  const client = await getClient();
  const codeVerifier = randomPKCECodeVerifier();
  const codeChallenge = await calculatePKCECodeChallenge(codeVerifier);
  const state = randomState();

  return {
    client,
    codeVerifier,
    parameters: {
      scope: 'openid profile offline_access',
      prompt: 'consent',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state,
      redirect_uri: OIDC.CLIENT_REDIRECT,
    },
  };
}

/**
 * Возвращает или инициализирует OIDC-клиент
 * @returns {Promise<Configuration>} Конфигурация OIDC-клиента
 */
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
