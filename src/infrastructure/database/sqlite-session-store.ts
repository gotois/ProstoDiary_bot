import { DatabaseSync } from 'node:sqlite';
import session, { type SessionData } from 'express-session';

const DEFAULT_TTL_SECONDS = 30 * 24 * 60 * 60;

type SessionRow = {
  data: string;
  expires_at: number;
};

/** Persistent Express session store backed by SQLite. */
export class SqliteSessionStore extends session.Store {
  readonly #database: DatabaseSync;
  readonly #ttlSeconds: number;

  constructor(database: DatabaseSync, ttlSeconds = DEFAULT_TTL_SECONDS) {
    super();
    this.#database = database;
    this.#ttlSeconds = ttlSeconds;
    database.exec(
      'CREATE TABLE IF NOT EXISTS bff_sessions (sid TEXT PRIMARY KEY, data TEXT NOT NULL, expires_at INTEGER NOT NULL) STRICT',
    );
    this.#deleteExpired();
  }

  get(sid: string, callback: (error: unknown, session?: SessionData | null) => void): void {
    try {
      this.#deleteExpired();
      const row = this.#database.prepare('SELECT data, expires_at FROM bff_sessions WHERE sid = ?').get(sid) as
        | SessionRow
        | undefined;
      callback(undefined, row ? (JSON.parse(row.data) as SessionData) : null);
    } catch (error) {
      callback(error);
    }
  }

  set(sid: string, value: SessionData, callback?: (error?: unknown) => void): void {
    try {
      const expiresAt = value.cookie.expires
        ? Math.floor(value.cookie.expires.getTime() / 1000)
        : Math.floor(Date.now() / 1000) + this.#ttlSeconds;
      this.#database
        .prepare(
          'INSERT INTO bff_sessions (sid, data, expires_at) VALUES (?, ?, ?) ON CONFLICT(sid) DO UPDATE SET data = excluded.data, expires_at = excluded.expires_at',
        )
        .run(sid, JSON.stringify(value), expiresAt);
      callback?.();
    } catch (error) {
      callback?.(error);
    }
  }

  destroy(sid: string, callback?: (error?: unknown) => void): void {
    try {
      this.#database.prepare('DELETE FROM bff_sessions WHERE sid = ?').run(sid);
      callback?.();
    } catch (error) {
      callback?.(error);
    }
  }

  touch(sid: string, value: SessionData, callback?: (error?: unknown) => void): void {
    this.set(sid, value, callback);
  }

  #deleteExpired(): void {
    this.#database.prepare('DELETE FROM bff_sessions WHERE expires_at <= unixepoch()').run();
  }
}
