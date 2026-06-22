import type { OidcGateway } from '../repositories/oidc-gateway.ts';

export class StartAuthorization {
  oidc: OidcGateway;

  constructor(oidc: OidcGateway) {
    this.oidc = oidc;
  }

  async execute(input: { initData?: string }): Promise<{ url: string; codeVerifier: string; state: string }> {
    return this.oidc.startAuthorization(input);
  }
}
