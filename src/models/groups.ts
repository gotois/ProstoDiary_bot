import { groupDB } from '../libs/database.ts';

interface Group {
  id: number;
  title: string;
  created_at: number;
}

try {
  groupDB.exec(`
    CREATE TABLE if not exists groups(
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL DEFAULT '',
      created_at INTEGER DEFAULT (unixepoch())
    ) STRICT
  `);
  const columns = groupDB.prepare('PRAGMA table_info(groups)').all();
  if (
    !columns.some((column) => {
      return column.name === 'title';
    })
  ) {
    groupDB.exec("ALTER TABLE groups ADD COLUMN title TEXT NOT NULL DEFAULT ''");
  }
  if (
    columns.some((column) => {
      return column.name === 'title_lower';
    })
  ) {
    groupDB.exec('ALTER TABLE groups DROP COLUMN title_lower');
  }
} catch (error) {
  console.error(error);
}

/**
 * @description Возвращает сохранённые Telegram-группы, отфильтрованные по названию
 * @param {string} query - Строка поиска по названию группы
 * @returns {Group[]} Сохранённые группы
 */
export const getGroups = (query = ''): Group[] => {
  const search = query.trim().toLowerCase();
  if (!search) {
    return [];
  }

  const escapedSearch = search.replaceAll('!', '!!').replaceAll('%', '!%').replaceAll('_', '!_');
  const statement = groupDB.prepare(`
    SELECT * FROM groups
    WHERE unicode_lower(title) LIKE ? ESCAPE '!'
    ORDER BY created_at DESC
  `);
  return statement.all(`%${escapedSearch}%`) as Group[];
};
/**
 * @description Сохраняет Telegram id группы
 * @param {Group} group - Telegram-группа
 */
export const setGroup = (group: Pick<Group, 'id' | 'title'>): void => {
  const insert = groupDB.prepare(`
    INSERT INTO groups (id, title) VALUES (:id, :title)
    ON CONFLICT(id)
    DO UPDATE SET title = excluded.title
  `);
  insert.run(group);
};
/**
 * @description Удаляет Telegram id группы
 * @param {number} groupId - Telegram id группы
 */
export const deleteGroup = (groupId: number): void => {
  const query = groupDB.prepare('DELETE FROM groups WHERE id == ?');
  query.run(groupId);
};
