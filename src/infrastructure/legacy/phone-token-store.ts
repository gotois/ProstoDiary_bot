import { jwtDecode } from 'jwt-decode';
import { container } from '../../app/container.ts';

/**
 *
 * @param userId
 * @param authorization
 */
export function setLegacyPhoneJWT(userId: number | string, authorization: string | null): void {
  const token = authorization?.replace(/^Bearer\s+/i, '');
  const claims = token ? jwtDecode<{ exp?: number; sub?: string }>(token) : undefined;
  if (!token || !claims?.exp || !claims.sub) throw new Error('Deprecated phone authorization response is invalid');
  container.userRepository.saveTokens(Number(userId), claims.sub, {
    accessToken: token,
    idToken: token,
    refreshToken: token,
    expiresAt: claims.exp,
  });
}
