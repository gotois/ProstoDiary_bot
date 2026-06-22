export type StartState = 'authorized' | 'needs-timezone' | 'needs-authorization';

export class GetStartState {
  async execute(input: {
    accessToken?: string | null;
    expiredAt?: number | null;
    timezone?: string | null;
  }): Promise<StartState> {
    const now = Date.now() / 1000;
    if (input.expiredAt && input.expiredAt >= now) return 'authorized';
    if (input.accessToken && !input.timezone) return 'needs-timezone';
    return 'needs-authorization';
  }
}
