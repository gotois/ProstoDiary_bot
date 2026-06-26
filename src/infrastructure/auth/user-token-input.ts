import { jwtDecode } from 'jwt-decode';

type TokenResponse = {
  access_token: string;
  id_token: string;
  refresh_token: string;
};

/**
 * Преобразует OIDC tokens в формат сохранения пользователя
 * @param input - входные данные пользователя
 * @param input.telegramId - Telegram id пользователя
 * @param input.actorId - ActivityPub actor id
 * @param input.tokens - OIDC tokens
 * @returns Данные для сохранения токенов пользователя
 */
export function toUserTokenInput(input: { telegramId: number; actorId: string; tokens: TokenResponse }) {
  const expiresAt = jwtDecode<{ exp?: number }>(input.tokens.id_token).exp;
  if (!expiresAt) {
    throw new Error('Missing token expiration');
  }
  return {
    telegramId: input.telegramId,
    actorId: input.actorId,
    accessToken: input.tokens.access_token,
    idToken: input.tokens.id_token,
    refreshToken: input.tokens.refresh_token,
    expiresAt,
  };
}
