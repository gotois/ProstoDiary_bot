import type { UserRepository } from '../repositories/user-repository.ts';

export class SaveUserTokens {
  users: UserRepository;

  constructor(users: UserRepository) {
    this.users = users;
  }

  async execute(input: {
    telegramId: number;
    actorId: string;
    accessToken: string;
    idToken: string;
    refreshToken: string;
    expiresAt: number;
  }): Promise<void> {
    return this.users.saveTokens(input.telegramId, input.actorId, {
      accessToken: input.accessToken,
      idToken: input.idToken,
      refreshToken: input.refreshToken,
      expiresAt: input.expiresAt,
    });
  }
}
