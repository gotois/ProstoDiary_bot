import type { UserRepository } from '../repositories/user-repository.ts';

export class UpdateUserLocation {
  users: UserRepository;

  constructor(users: UserRepository) {
    this.users = users;
  }

  async execute(input: { telegramId: number; latitude: number; longitude: number; accuracy?: number }): Promise<void> {
    const accuracy = input.accuracy ?? 50;
    return this.users.updateLocation(
      input.telegramId,
      `geo:${input.latitude},${input.longitude};cgen=gps;u=${accuracy}`,
    );
  }
}
