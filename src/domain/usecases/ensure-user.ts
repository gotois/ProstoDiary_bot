import type { User } from '../entities/user.ts';
import type { UserRepository } from '../repositories/user-repository.ts';

export class SecretaryUser {
  users: UserRepository;

  constructor(users: UserRepository) {
    this.users = users;
  }

  ensureUser(input: { telegramId: number; language?: string }): User | undefined {
    const existing = this.users.findById(input.telegramId);
    if (existing) {
      return existing;
    }

    const user = this.users.create(input.telegramId);
    if (user && input.language) {
      this.users.updateLanguage(user.id, input.language);
    }

    return this.users.findById(input.telegramId);
  }

  updateUserLocation(input: { telegramId: number; latitude: number; longitude: number; accuracy?: number }): void {
    const accuracy = input.accuracy ?? 50;
    return this.users.updateLocation(
      input.telegramId,
      `geo:${input.latitude},${input.longitude};cgen=gps;u=${accuracy}`,
    );
  }

  updateUserTimezone(input: { telegramId: number; timezone: string }): void {
    return this.users.updateTimezone(input.telegramId, input.timezone);
  }

  clearUserTokens(input: { telegramId: number }): void {
    return this.users.clearTokens(input.telegramId);
  }

  saveUserTokens(input: {
    telegramId: number;
    actorId: string;
    accessToken: string;
    idToken: string;
    refreshToken: string;
    expiresAt: number;
  }): void {
    return this.users.saveTokens(input.telegramId, input.actorId, {
      accessToken: input.accessToken,
      idToken: input.idToken,
      refreshToken: input.refreshToken,
      expiresAt: input.expiresAt,
    });
  }

  deleteUser(input: { telegramId: number }): void {
    return this.users.delete(input.telegramId);
  }
}
