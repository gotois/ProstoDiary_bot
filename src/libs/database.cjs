const sqlite = require('node:sqlite');
const { DATABASE } = require('../environments/index.cjs');

const userDB = new sqlite.DatabaseSync(DATABASE.USERS);
const messageDB = new sqlite.DatabaseSync(':memory:');
const calendarsDB = new sqlite.DatabaseSync(DATABASE.CALENDARS);

module.exports.userDB = userDB;
module.exports.calendarsDB = calendarsDB;
module.exports.messageDB = messageDB;

function createMessagesTable() {
  messageDB.exec(`
    CREATE TABLE if not exists messages(
      message_id INTEGER PRIMARY KEY,
      chat_id INTEGER,
      message_text TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    ) STRICT
  `);
}

function createUsersTable() {
  userDB.exec(`
      CREATE TABLE if not exists users(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        location TEXT NULL,
        timezone TEXT DEFAULT 'UTC',
        jwt TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      ) STRICT
    `);
}

function createCalendarsTable() {
  calendarsDB.exec(`
    CREATE TABLE if not exists calendars(
      id INTEGER PRIMARY KEY,
      message_id INTEGER,
      title TEXT,
      details TEXT NULL,
      location TEXT NULL,
      start INTEGER,
      end INTEGER,
      geo TEXT NULL
    ) STRICT
  `);
}

try {
  createMessagesTable();
} catch (error) {
  console.warn(error);
}
try {
  createUsersTable();
} catch (error) {
  console.warn(error);
}
try {
  createCalendarsTable();
} catch (error) {
  console.warn(error);
}
