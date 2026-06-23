import { DatabaseSync } from 'node:sqlite';
import { DATABASE } from '#env';

export const userDB = new DatabaseSync(DATABASE.USERS);
export const groupDB = new DatabaseSync(DATABASE.GROUPS);
export const eventsDB = new DatabaseSync(DATABASE.EVENTS);

groupDB.function('unicode_lower', (value: string): string => {
  return value.toLowerCase();
});
