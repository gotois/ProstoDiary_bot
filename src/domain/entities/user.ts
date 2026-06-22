export interface User {
  id: number;
  actorId: string | null;
  location: string | null;
  language: string;
  timezone: string | null;
  accessToken: string | null;
  idToken: string | null;
  refreshToken: string | null;
  createdAt: number;
  expiredAt: number | null;
}
