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
