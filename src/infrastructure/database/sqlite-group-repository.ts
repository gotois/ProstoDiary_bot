import { DatabaseSync } from 'node:sqlite';
import type { Group } from '../../domain/entities/group.ts';
import type { GroupRepository } from '../../domain/repositories/group-repository.ts';

type GroupRow = {
  id: number;
  title: string;
  created_at: number;
};

export class SqliteGroupRepository implements GroupRepository {
  #database: DatabaseSync;

  constructor(database: DatabaseSync) {
    this.#database = database;
    database.function('unicode_lower', (value: string): string => {
      return value.toLowerCase();
    });
    database.exec(
      "CREATE TABLE if not exists groups(id INTEGER PRIMARY KEY, title TEXT NOT NULL DEFAULT '', created_at INTEGER DEFAULT (unixepoch())) STRICT",
    );
    const columns = database.prepare('PRAGMA table_info(groups)').all() as Array<{ name: string }>;
    if (
      !columns.some((column) => {
        return column.name === 'title';
      })
    ) {
      database.exec("ALTER TABLE groups ADD COLUMN title TEXT NOT NULL DEFAULT ''");
    }
    if (
      columns.some((column) => {
        return column.name === 'title_lower';
      })
    ) {
      database.exec('ALTER TABLE groups DROP COLUMN title_lower');
    }
  }

  findByTitle(query: string): Group[] {
    const search = query.trim().toLowerCase();
    if (!search) return [];
    const escapedSearch = search.replaceAll('!', '!!').replaceAll('%', '!%').replaceAll('_', '!_');
    return this.#database
      .prepare("SELECT * FROM groups WHERE unicode_lower(title) LIKE ? ESCAPE '!' ORDER BY created_at DESC")
      .all(`%${escapedSearch}%`)
      .map((row: GroupRow) => {
        return { id: row.id, title: row.title, createdAt: row.created_at };
      });
  }

  save(group: Pick<Group, 'id' | 'title'>): void {
    this.#database
      .prepare('INSERT INTO groups (id, title) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET title = excluded.title')
      .run(group.id, group.title);
  }

  delete(id: number): void {
    this.#database.prepare('DELETE FROM groups WHERE id == ?').run(id);
  }
}
