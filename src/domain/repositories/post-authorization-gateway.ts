export interface PostAuthorizationGateway {
  prepareWelcome(input: {
    actorId: string;
    accessToken: string;
    tokenType: string;
    timezone: string;
    webhookUrl: string;
  }): Promise<{ documentUrl?: string }>;
}
