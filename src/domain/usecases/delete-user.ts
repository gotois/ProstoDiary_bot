import type { UserRepository } from '../repositories/user-repository.ts';

export class DeleteUser {
  users: UserRepository;

  constructor(users: UserRepository) {
    this.users = users;
  }

  async execute(input: { telegramId: number }): Promise<void> {
    await this.users.delete(input.telegramId);
  }
}
