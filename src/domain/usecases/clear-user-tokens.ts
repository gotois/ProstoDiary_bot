import type { UserRepository } from '../repositories/user-repository.ts';

export class ClearUserTokens {
  users: UserRepository;

  constructor(users: UserRepository) {
    this.users = users;
  }

  async execute(input: { telegramId: number }): Promise<void> {
    await this.users.clearTokens(input.telegramId);
  }
}
