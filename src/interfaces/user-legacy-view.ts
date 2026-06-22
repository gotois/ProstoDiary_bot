import type { User } from '../domain/entities/user.ts';

/**
 *
 * @param user
 */
export function toLegacyUser(user: User) {
  return {
    id: user.id,
    actor_id: user.actorId,
    location: user.location,
    language: user.language,
    timezone: user.timezone,
    access_token: user.accessToken,
    id_token: user.idToken,
    refresh_token: user.refreshToken,
    created_at: user.createdAt,
    expired_at: user.expiredAt,
  };
}
