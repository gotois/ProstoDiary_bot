export interface OidcGateway {
  startAuthorization(input: { initData?: string }): Promise<{ url: string; codeVerifier: string; state: string }>;
  completeAuthorization(input: { callbackUrl: URL; codeVerifier: string; state: string }): Promise<{
    telegramId: number;
    actorId: string;
    timezone: string;
    tokens: {
      accessToken: string;
      idToken?: string;
      refreshToken?: string;
      tokenType: string;
    };
  }>;
  refreshTokens(refreshToken: string): Promise<{ accessToken: string; idToken?: string; refreshToken?: string }>;
}
