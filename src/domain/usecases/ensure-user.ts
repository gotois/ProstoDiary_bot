import type { User } from '../entities/user.ts';
import type { UserRepository } from '../repositories/user-repository.ts';

export class EnsureUser {
  users: UserRepository;

  constructor(users: UserRepository) {
    this.users = users;
  }

  async execute(input: { telegramId: number; language?: string }): Promise<User | undefined> {
    const existing = await this.users.findById(input.telegramId);
    if (existing) return existing;

    const user = await this.users.create(input.telegramId);
    if (user && input.language) await this.users.updateLanguage(user.id, input.language);
    return this.users.findById(input.telegramId);
  }
}
