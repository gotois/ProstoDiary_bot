import type { OidcGateway } from '../repositories/oidc-gateway.ts';

export class RefreshUserTokens {
  oidc: OidcGateway;

  constructor(oidc: OidcGateway) {
    this.oidc = oidc;
  }

  execute(input: { refreshToken: string }) {
    return this.oidc.refreshTokens(input);
  }
}
