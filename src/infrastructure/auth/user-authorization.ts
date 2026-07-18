import type { User } from '../../domain/entities/user.ts';
import type { UserRepository } from '../../domain/repositories/user-repository.ts';
import { SolidAuthorizationRequiredError, type SolidSessionManager } from '../solid/solid-session-manager.ts';

export class AuthorizationRequiredError extends Error {
  constructor() {
    super('Bot authorization required');
    this.name = 'AuthorizationRequiredError';
  }
}

export interface ActiveUserAuthorization {
  user: User;
  tokenType: string;
}

/**
 * Управляет единым bot grant пользователя и сериализует refresh token rotation.
 */
export class UserAuthorization {
  readonly #users: UserRepository;
  readonly #solidSessions: SolidSessionManager;
  readonly #refreshes = new Map<number, Promise<ActiveUserAuthorization>>();

  constructor(users: UserRepository, solidSessions: SolidSessionManager) {
    this.#users = users;
    this.#solidSessions = solidSessions;
  }

  ensureByActorId(actorId: string): Promise<ActiveUserAuthorization> {
    const user = this.#users.findByActorId(actorId);
    if (!user) {
      return Promise.reject(new AuthorizationRequiredError());
    }
    return this.ensureById(user.id);
  }

  ensureById(userId: number): Promise<ActiveUserAuthorization> {
    const activeRefresh = this.#refreshes.get(userId);
    if (activeRefresh) {
      return activeRefresh;
    }

    const refresh = this.#refreshUser(userId).finally(() => {
      this.#refreshes.delete(userId);
    });
    this.#refreshes.set(userId, refresh);
    return refresh;
  }

  async #refreshUser(userId: number): Promise<ActiveUserAuthorization> {
    try {
      const active = await this.#solidSessions.getByTelegramId(userId);
      const updatedUser = this.#users.findById(userId);
      if (!updatedUser?.accessToken) {
        throw new AuthorizationRequiredError();
      }
      return { user: updatedUser, tokenType: active.authorization.tokenType };
    } catch (error) {
      if (error instanceof SolidAuthorizationRequiredError) {
        this.#users.clearTokens(userId);
        throw new AuthorizationRequiredError();
      }
      throw error;
    }
  }
}
