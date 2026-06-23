import type { UserRepository } from '../repositories/user-repository.ts';

export class UpdateUserTimezone {
  users: UserRepository;

  constructor(users: UserRepository) {
    this.users = users;
  }

  async execute(input: { telegramId: number; timezone: string }): Promise<void> {
    return this.users.updateTimezone(input.telegramId, input.timezone);
  }
}
