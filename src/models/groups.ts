import { userDB } from '../libs/database.ts';

try {
  userDB.exec(`
    CREATE TABLE if not exists groups(
      id INTEGER PRIMARY KEY,
      created_at INTEGER DEFAULT (unixepoch())
    ) STRICT
  `);
} catch (error) {
  console.error(error);
}

interface Group {
  id: number;
  created_at: number;
}

/**
 * @description Возвращает Telegram id сохранённых групп
 * @returns {Group[]} Сохранённые группы
 */
export const getGroups = (): Group[] => {
  const query = userDB.prepare('SELECT * FROM groups ORDER BY created_at DESC');
  return query.all() as Group[];
};

/**
 * @description Сохраняет Telegram id группы
 * @param {number} groupId - Telegram id группы
 */
export const setGroup = (groupId: number): void => {
  const insert = userDB.prepare(`
    INSERT INTO groups (id) VALUES (:id)
    ON CONFLICT(id)
    DO NOTHING
  `);
  insert.run({ id: groupId });
};
/**
 * @description Удаляет Telegram id группы
 * @param {number} groupId - Telegram id группы
 */
export const deleteGroup = (groupId: number): void => {
  const query = userDB.prepare('DELETE FROM groups WHERE id == ?');
  query.run(groupId);
};
