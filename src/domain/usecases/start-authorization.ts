import type { OidcGateway } from '../repositories/oidc-gateway.ts';

export class SecretaryOIDC {
  oidc: OidcGateway;
  constructor(oidc: OidcGateway) {
    this.oidc = oidc;
  }
  startAuthorization(input: { initData?: string }): Promise<{ url: string; codeVerifier: string; state: string }> {
    return this.oidc.startAuthorization(input);
  }
  completeAuthorization(input: { callbackUrl: URL; codeVerifier: string; state: string }) {
    return this.oidc.completeAuthorization(input);
  }
  refreshTokens(refreshToken: string) {
    return this.oidc.refreshTokens(refreshToken);
  }
}
