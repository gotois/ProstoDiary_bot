import type { OidcGateway } from '../repositories/oidc-gateway.ts';

export class CompleteAuthorization {
  oidc: OidcGateway;

  constructor(oidc: OidcGateway) {
    this.oidc = oidc;
  }

  execute(input: { callbackUrl: URL; codeVerifier: string; state: string }) {
    return this.oidc.completeAuthorization(input);
  }
}
