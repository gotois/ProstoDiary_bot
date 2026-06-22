import type { User } from '../entities/user.ts';

export interface UserRepository {
  findById(id: number): User | undefined;
  findByActorId(actorId: string): User | undefined;
  create(id: number): User | undefined;
  delete(id: number): void;
  updateLocation(id: number, location: string): void;
  updateTimezone(id: number, timezone: string): void;
  updateLanguage(id: number, language: string): void;
  clearTokens(id: number): void;
  saveTokens(
    id: number,
    actorId: string,
    tokens: { accessToken: string; idToken: string; refreshToken: string; expiresAt: number },
  ): void;
}
