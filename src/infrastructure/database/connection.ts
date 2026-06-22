import { DatabaseSync } from 'node:sqlite';
import { DATABASE } from '#env';

export const userDB = new DatabaseSync(DATABASE.USERS);
export const groupDB = new DatabaseSync(DATABASE.GROUPS);

// TODO: Создать в groupDB таблицу telegram_events (task_id, chat_id, message_id),
// чтобы связать задачу Secretary с сообщением группового чата.

groupDB.function('unicode_lower', (value: string): string => {
  return value.toLowerCase();
});
