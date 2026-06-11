import { jwtDecode } from 'jwt-decode';
import { userDB } from '../libs/database.ts';

export interface User {
  id: number;
  actor_id: string | null;
  location: string | null;
  language: string;
  timezone: string | null;
  access_token: string | null;
  id_token: string | null;
  refresh_token: string | null;
  created_at: number;
  expired_at: number | null;
}

/**
 * Проверяет, является ли значение объектом User
 * @param {unknown} value - проверяемое значение
 * @returns {value is User} true если объект является User
 */
function isUser(value: unknown): value is User {
  return typeof value === 'object' && value !== null && 'id' in value;
}

try {
  userDB.exec(`
    CREATE TABLE if not exists users(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      actor_id TEXT,
      location TEXT NULL,
      language TEXT DEFAULT 'en',
      timezone TEXT NULL,
      access_token TEXT,
      id_token TEXT,
      refresh_token TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      expired_at INTEGER NULL
    ) STRICT
  `);
} catch (error) {
  console.error(error);
}

/**
 * Удаляет пользователя по id
 * @param {number} userId - Telegram id пользователя
 */
export const deleteUser = (userId: number): void => {
  const query = userDB.prepare('DELETE FROM users WHERE id == ?');
  query.run(userId);
};
/**
 * Проверяет существование пользователя по telegram id
 */
export const hasUser = (userId: number): boolean => {
  const query = userDB.prepare('SELECT * FROM users WHERE id == ?');
  const users = query.all(userId);
  return users.length > 0;
};
/**
 * Возвращает пользователя по telegram id
 */
export const getUser = (userId: number): User | undefined => {
  const query = userDB.prepare('SELECT * FROM users WHERE id == ?');
  const row = query.get(userId);
  return isUser(row) ? row : undefined;
};
/**
 * Возвращает пользователя по actor id секретаря
 */
export const getUserByActorId = (actorId: string): User | undefined => {
  const query = userDB.prepare('SELECT * FROM users WHERE actor_id == ?');
  const row = query.get(actorId);
  return isUser(row) ? row : undefined;
};
/**
 * Создаёт нового пользователя по telegram id
 */
export const setNewUser = (userId: number): User | undefined => {
  const insert = userDB.prepare(`
    INSERT INTO users (id) VALUES (:id)
  `);
  insert.run({ id: userId });
  return getUser(userId);
};
/**
 * Обновление местоположения пользователя
 * @param {number} userId - Telegram id пользователя
 * @param {object} root0 - координаты местоположения
 * @param {number} root0.latitude - широта
 * @param {number} root0.longitude - долгота
 * @param {number} [root0.u] - точность определения (метры)
 * @see https://www.here.com/docs/bundle/places-search-api-developer-guide/page/topics/location-contexts.html#location-contexts__position-format
 */
export const updateUserLocation = (
  userId: number,
  { latitude, longitude, u = 50 }: { latitude: number; longitude: number; u?: number },
): void => {
  const location = `geo:${latitude},${longitude};cgen=gps;u=${u}`;
  const insert = userDB.prepare(`
    INSERT INTO users (id, location) VALUES (:id, :location)
    ON CONFLICT(id)
    DO
      UPDATE SET location = :location
      WHERE id = :id
  `);
  insert.run({ id: userId, location });
};
/**
 * Обновление часового пояса пользователя
 * @param {number|string} userId - Telegram id пользователя
 * @param {string} timezone - часовой пояс в формате IANA
 */
export const updateUserTimezone = (userId: number | string, timezone: string): void => {
  const insert = userDB.prepare(`
    INSERT INTO users (id, timezone) VALUES (:id, :timezone)
    ON CONFLICT(id)
    DO
      UPDATE SET timezone = :timezone
      WHERE id = :id
  `);
  insert.run({ id: Number(userId), timezone });
};
/**
 * Обновление JWT токенов пользователя
 * @param {number|string} userId - Telegram id пользователя
 * @param {string} actorId - actor id из системы секретаря
 * @param {object} tokens - объект с токенами
 * @param {string} tokens.access_token - access token
 * @param {number} tokens.expires_in - время жизни токена в секундах
 * @param {string} tokens.id_token - id token
 * @param {string} tokens.refresh_token - refresh token
 * @param {string} tokens.token_type - тип токена
 */
export const setJWT = (
  userId: number | string,
  actorId: string,
  tokens: { access_token: string; expires_in: number; id_token: string; refresh_token: string; token_type: string },
): void => {
  const { access_token, id_token, refresh_token } = tokens;
  const { exp } = jwtDecode(id_token);
  const insert = userDB.prepare(`
    INSERT INTO users (id, actor_id, access_token, id_token, refresh_token, expired_at) VALUES (:id, :actor_id, :access_token, :id_token, :refresh_token, :exp)
    ON CONFLICT(id)
    DO
      UPDATE SET
        actor_id = :actor_id,
        access_token = :access_token,
        id_token = :id_token,
        refresh_token = :refresh_token,
        expired_at = :exp
      WHERE id = :id
  `);
  insert.run({ id: userId, actor_id: actorId, access_token, id_token, refresh_token, exp });
};
/**
 * Обновление языка пользователя
 * @param {number} userId - Telegram id пользователя
 * @param {string} language - код языка (IETF BCP 47)
 */
export const setLanguage = (userId: number, language: string): void => {
  const insert = userDB.prepare(`
    INSERT INTO users (id, language) VALUES (:id, :language)
    ON CONFLICT(id)
    DO
      UPDATE SET language = :language
      WHERE id = :id
  `);
  insert.run({ id: userId, language });
};
