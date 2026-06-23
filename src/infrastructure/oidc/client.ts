import {
  type Configuration,
  randomPKCECodeVerifier,
  calculatePKCECodeChallenge,
  randomState,
  discovery,
  buildAuthorizationUrl,
  buildAuthorizationUrlWithPAR,
  authorizationCodeGrant,
  fetchUserInfo,
  refreshTokenGrant,
} from 'openid-client';
import { SECRETARY, OIDC } from '#env';
import type { OidcGateway } from '../../domain/repositories/oidc-gateway.ts';

let client: Configuration | undefined;

//Создаёт объект параметров авторизации PKCE
async function getAuthorization() {
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

// Возвращает или инициализирует OIDC-клиент
async function getClient(): Promise<Configuration> {
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

export default class SecretaryOidcGateway implements OidcGateway {
  async refreshTokens(input: {
    refreshToken: string;
  }): Promise<{ accessToken: string; idToken?: string; refreshToken?: string }> {
    const tokens = await refreshTokenGrant(await getClient(), input.refreshToken);
    return { accessToken: tokens.access_token, idToken: tokens.id_token, refreshToken: tokens.refresh_token };
  }

  async startAuthorization(input: {
    initData?: string;
  }): Promise<{ url: string; codeVerifier: string; state: string }> {
    const { client, codeVerifier, parameters } = await getAuthorization();
    const authorizationUrl = input.initData
      ? await buildAuthorizationUrlWithPAR(client, { ...parameters, tma_init_data: input.initData })
      : buildAuthorizationUrl(client, parameters);

    return {
      url: authorizationUrl.toString(),
      codeVerifier,
      state: parameters.state,
    };
  }

  async completeAuthorization(input: { callbackUrl: URL; codeVerifier: string; state: string }) {
    const oidcClient = await getClient();
    const tokens = await authorizationCodeGrant(oidcClient, input.callbackUrl, {
      pkceCodeVerifier: input.codeVerifier,
      expectedState: input.state,
    });
    const userInfo = await fetchUserInfo(oidcClient, tokens.access_token, tokens.claims().sub);
    if (!userInfo.tid || !userInfo.sub || !userInfo.tz) {
      throw new TypeError('Telegram не подключен к аккаунту');
    }

    return {
      telegramId: Number(userInfo.tid),
      actorId: userInfo.sub,
      timezone: userInfo.tz,
      tokens: {
        accessToken: tokens.access_token,
        idToken: tokens.id_token ?? '',
        refreshToken: tokens.refresh_token ?? '',
        tokenType: tokens.token_type,
      },
    };
  }
}
