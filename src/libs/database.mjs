import { DatabaseSync } from 'node:sqlite';
import env from '../environments/index.mjs';

export const userDB = new DatabaseSync(env.DATABASE.USERS);
