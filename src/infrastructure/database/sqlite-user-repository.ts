import { DatabaseSync } from 'node:sqlite';
import type { User } from '../../domain/entities/user.ts';
import type { UserRepository } from '../../domain/repositories/user-repository.ts';

type UserRow = {
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
};
const toUser = (row: UserRow): User => {
  return {
    id: row.id,
    actorId: row.actor_id,
    location: row.location,
    language: row.language,
    timezone: row.timezone,
    accessToken: row.access_token,
    idToken: row.id_token,
    refreshToken: row.refresh_token,
    createdAt: row.created_at,
    expiredAt: row.expired_at,
  };
};

export class SqliteUserRepository implements UserRepository {
  database: DatabaseSync;

  constructor(database: DatabaseSync) {
    this.database = database;
    database.exec(
      "CREATE TABLE if not exists users(id INTEGER PRIMARY KEY AUTOINCREMENT, actor_id TEXT, location TEXT NULL, language TEXT DEFAULT 'en', timezone TEXT NULL, access_token TEXT, id_token TEXT, refresh_token TEXT, created_at INTEGER DEFAULT (unixepoch()), expired_at INTEGER NULL) STRICT",
    );
  }
  findById(id: number): User | undefined {
    const row = this.database.prepare('SELECT * FROM users WHERE id == ?').get(id) as UserRow | undefined;
    return row && toUser(row);
  }
  findByActorId(actorId: string): User | undefined {
    const row = this.database.prepare('SELECT * FROM users WHERE actor_id == ?').get(actorId) as UserRow | undefined;
    return row && toUser(row);
  }
  create(id: number): User | undefined {
    this.database.prepare('INSERT INTO users (id) VALUES (?)').run(id);
    return this.findById(id);
  }
  delete(id: number): void {
    this.database.prepare('DELETE FROM users WHERE id == ?').run(id);
  }
  updateLocation(id: number, location: string): void {
    this.database
      .prepare(
        'INSERT INTO users (id, location) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET location = excluded.location',
      )
      .run(id, location);
  }
  updateTimezone(id: number, timezone: string): void {
    this.database
      .prepare(
        'INSERT INTO users (id, timezone) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET timezone = excluded.timezone',
      )
      .run(id, timezone);
  }
  updateLanguage(id: number, language: string): void {
    this.database
      .prepare(
        'INSERT INTO users (id, language) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET language = excluded.language',
      )
      .run(id, language);
  }
  clearTokens(id: number): void {
    this.database
      .prepare(
        'UPDATE users SET access_token = NULL, id_token = NULL, refresh_token = NULL, expired_at = NULL WHERE id == ?',
      )
      .run(id);
  }
  saveTokens(
    id: number,
    actorId: string,
    tokens: { accessToken: string; idToken: string; refreshToken: string; expiresAt: number },
  ): void {
    this.database
      .prepare(
        'INSERT INTO users (id, actor_id, access_token, id_token, refresh_token, expired_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET actor_id=excluded.actor_id, access_token=excluded.access_token, id_token=excluded.id_token, refresh_token=excluded.refresh_token, expired_at=excluded.expired_at',
      )
      .run(id, actorId, tokens.accessToken, tokens.idToken, tokens.refreshToken, tokens.expiresAt);
  }
}
