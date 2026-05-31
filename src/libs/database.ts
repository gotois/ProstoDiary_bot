import { DatabaseSync } from 'node:sqlite';
import env from '../environments/index.ts';

export const userDB = new DatabaseSync(env.DATABASE.USERS);
