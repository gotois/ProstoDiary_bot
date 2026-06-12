import { DatabaseSync } from 'node:sqlite';
import { DATABASE } from '#env';

export const userDB = new DatabaseSync(DATABASE.USERS);
