import { DatabaseSync } from 'node:sqlite';
import type { IStorage, SessionTokenSet } from '@inrupt/solid-client-authn-node';

export interface OAuthTransaction {
  state: string;
  solidSessionId: string;
  bffSessionId: string;
  issuer: string;
  isTma: boolean;
  telegramId?: number;
  expiresAt: number;
}

export interface SolidAuthorization {
  id: string;
  issuer: string;
  webId: string;
  telegramId?: number;
  accessToken: string;
  idToken?: string;
  tokenType: 'Bearer' | 'DPoP';
  expiresAt?: number;
}

export interface OidcClientRegistration {
  issuer: string;
  clientId: string;
  clientSecret?: string;
}

type TransactionRow = {
  state: string;
  solid_session_id: string;
  bff_session_id: string;
  issuer: string;
  is_tma: number;
  telegram_id: number | null;
  expires_at: number;
};

type AuthorizationRow = {
  id: string;
  issuer: string;
  web_id: string;
  telegram_id: number | null;
  access_token: string;
  id_token: string | null;
  token_type: 'Bearer' | 'DPoP';
  expires_at: number | null;
};

type ClientRow = {
  issuer: string;
  client_id: string;
  client_secret: string | null;
};

export class SqliteSolidAuthRepository implements IStorage {
  readonly #database: DatabaseSync;

  constructor(database: DatabaseSync) {
    this.#database = database;
    database.exec(`
      CREATE TABLE IF NOT EXISTS solid_auth_storage (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL DEFAULT (unixepoch())
      ) STRICT;
      CREATE TABLE IF NOT EXISTS oauth_transactions (
        state TEXT PRIMARY KEY,
        solid_session_id TEXT NOT NULL,
        bff_session_id TEXT NOT NULL,
        issuer TEXT NOT NULL,
        is_tma INTEGER NOT NULL,
        telegram_id INTEGER,
        expires_at INTEGER NOT NULL,
        consumed_at INTEGER
      ) STRICT;
      CREATE TABLE IF NOT EXISTS solid_authorizations (
        id TEXT PRIMARY KEY,
        issuer TEXT NOT NULL,
        web_id TEXT NOT NULL,
        telegram_id INTEGER,
        access_token TEXT NOT NULL,
        id_token TEXT,
        token_type TEXT NOT NULL,
        expires_at INTEGER,
        updated_at INTEGER NOT NULL DEFAULT (unixepoch())
      ) STRICT;
      CREATE INDEX IF NOT EXISTS solid_authorizations_telegram_issuer
        ON solid_authorizations (telegram_id, issuer);
      CREATE TABLE IF NOT EXISTS oidc_client_registrations (
        issuer TEXT PRIMARY KEY,
        client_id TEXT NOT NULL,
        client_secret TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      ) STRICT;
    `);
    this.deleteExpiredTransactions();
  }

  get(key: string): Promise<string | undefined> {
    const row = this.#database.prepare('SELECT value FROM solid_auth_storage WHERE key = ?').get(key) as
      | { value: string }
      | undefined;
    return Promise.resolve(row?.value);
  }

  set(key: string, value: string): Promise<void> {
    this.#database
      .prepare(
        'INSERT INTO solid_auth_storage (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = unixepoch()',
      )
      .run(key, value);
    return Promise.resolve();
  }

  delete(key: string): Promise<void> {
    this.#database.prepare('DELETE FROM solid_auth_storage WHERE key = ?').run(key);
    return Promise.resolve();
  }

  saveTransaction(transaction: OAuthTransaction): void {
    this.#database
      .prepare(
        'INSERT INTO oauth_transactions (state, solid_session_id, bff_session_id, issuer, is_tma, telegram_id, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(state) DO UPDATE SET solid_session_id = excluded.solid_session_id, bff_session_id = excluded.bff_session_id, issuer = excluded.issuer, is_tma = excluded.is_tma, telegram_id = excluded.telegram_id, expires_at = excluded.expires_at, consumed_at = NULL',
      )
      .run(
        transaction.state,
        transaction.solidSessionId,
        transaction.bffSessionId,
        transaction.issuer,
        Number(transaction.isTma),
        transaction.telegramId ?? null,
        transaction.expiresAt,
      );
  }

  findTransaction(state: string): OAuthTransaction | undefined {
    this.deleteExpiredTransactions();
    const row = this.#database
      .prepare(
        'SELECT state, solid_session_id, bff_session_id, issuer, is_tma, telegram_id, expires_at FROM oauth_transactions WHERE state = ? AND consumed_at IS NULL AND expires_at > unixepoch()',
      )
      .get(state) as TransactionRow | undefined;
    return (
      row && {
        state: row.state,
        solidSessionId: row.solid_session_id,
        bffSessionId: row.bff_session_id,
        issuer: row.issuer,
        isTma: row.is_tma === 1,
        telegramId: row.telegram_id ?? undefined,
        expiresAt: row.expires_at,
      }
    );
  }

  consumeTransaction(state: string): void {
    this.#database
      .prepare('UPDATE oauth_transactions SET consumed_at = unixepoch() WHERE state = ? AND consumed_at IS NULL')
      .run(state);
  }

  deleteExpiredTransactions(): void {
    this.#database.prepare('DELETE FROM oauth_transactions WHERE expires_at <= unixepoch()').run();
  }

  saveAuthorization(
    input: Omit<SolidAuthorization, 'accessToken' | 'tokenType'> & {
      tokens: SessionTokenSet;
      tokenType: 'Bearer' | 'DPoP';
    },
  ): SolidAuthorization {
    if (!input.tokens.accessToken) {
      throw new TypeError('Solid access token is missing');
    }
    this.#database
      .prepare(
        'INSERT INTO solid_authorizations (id, issuer, web_id, telegram_id, access_token, id_token, token_type, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET issuer = excluded.issuer, web_id = excluded.web_id, telegram_id = COALESCE(excluded.telegram_id, solid_authorizations.telegram_id), access_token = excluded.access_token, id_token = COALESCE(excluded.id_token, solid_authorizations.id_token), token_type = excluded.token_type, expires_at = excluded.expires_at, updated_at = unixepoch()',
      )
      .run(
        input.id,
        input.issuer,
        input.webId,
        input.telegramId ?? null,
        input.tokens.accessToken,
        input.tokens.idToken ?? null,
        input.tokenType,
        input.tokens.expiresAt ?? null,
      );
    const authorization = this.findAuthorizationById(input.id);
    if (!authorization) {
      throw new Error('Unable to persist Solid authorization');
    }
    return authorization;
  }

  findAuthorizationById(id: string): SolidAuthorization | undefined {
    const row = this.#database.prepare('SELECT * FROM solid_authorizations WHERE id = ?').get(id) as
      | AuthorizationRow
      | undefined;
    return row && this.#toAuthorization(row);
  }

  findAuthorizationByTelegramId(telegramId: number, issuer: string): SolidAuthorization | undefined {
    const row = this.#database
      .prepare(
        'SELECT * FROM solid_authorizations WHERE telegram_id = ? AND issuer = ? ORDER BY updated_at DESC LIMIT 1',
      )
      .get(telegramId, issuer) as AuthorizationRow | undefined;
    return row && this.#toAuthorization(row);
  }

  updateAuthorizationTokens(id: string, tokens: SessionTokenSet): void {
    if (!tokens.accessToken) {
      return;
    }
    this.#database
      .prepare(
        'UPDATE solid_authorizations SET access_token = ?, id_token = COALESCE(?, id_token), expires_at = ?, updated_at = unixepoch() WHERE id = ?',
      )
      .run(tokens.accessToken, tokens.idToken ?? null, tokens.expiresAt ?? null, id);
  }

  findClient(issuer: string): OidcClientRegistration | undefined {
    const row = this.#database
      .prepare('SELECT issuer, client_id, client_secret FROM oidc_client_registrations WHERE issuer = ?')
      .get(issuer) as ClientRow | undefined;
    return (
      row && {
        issuer: row.issuer,
        clientId: row.client_id,
        clientSecret: row.client_secret ?? undefined,
      }
    );
  }

  saveClient(client: OidcClientRegistration): void {
    this.#database
      .prepare(
        'INSERT INTO oidc_client_registrations (issuer, client_id, client_secret) VALUES (?, ?, ?) ON CONFLICT(issuer) DO UPDATE SET client_id = excluded.client_id, client_secret = excluded.client_secret',
      )
      .run(client.issuer, client.clientId, client.clientSecret ?? null);
  }

  #toAuthorization(row: AuthorizationRow): SolidAuthorization {
    return {
      id: row.id,
      issuer: row.issuer,
      webId: row.web_id,
      telegramId: row.telegram_id ?? undefined,
      accessToken: row.access_token,
      idToken: row.id_token ?? undefined,
      tokenType: row.token_type,
      expiresAt: row.expires_at ?? undefined,
    };
  }
}
