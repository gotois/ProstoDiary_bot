const sqlite = require('node:sqlite');

function createUsersTable() {
  database.exec(`
      CREATE TABLE if not exists users(
        key INTEGER PRIMARY KEY,
        jwt TEXT
      ) STRICT
    `);
}

function createCalendarsTable() {
  database.exec(`
      CREATE TABLE if not exists calendars(
        id INTEGER PRIMARY KEY,
        idUser INTEGER,
        ical TEXT
      ) STRICT
    `);
}

const database = (() => {
  if (process.env.NODE_ENV?.toLowerCase()?.startsWith('dev')) {
    return new sqlite.DatabaseSync('database.sqlite');
  } else {
    return new sqlite.DatabaseSync(':memory:');
  }
})();
try {
  createUsersTable();
} catch {}
try {
  createCalendarsTable();
} catch {}

module.exports = database;

module.exports.getUsers = (idUser) => {
  const query = database.prepare(`SELECT * FROM users WHERE key == ${idUser}`);
  const users = query.all();
  return users;
};

module.exports.setJWT = (userId, jwt) => {
  const insert = database.prepare(`
    INSERT INTO users (key, jwt) VALUES (?, ?)
    ON CONFLICT(key)
    DO
      UPDATE SET jwt = ("${jwt}")
      WHERE key = ("${userId}")
  `);
  insert.run(userId, jwt);
};

module.exports.getCalendars = (id, idUser) => {
  const query = database.prepare(`SELECT * FROM calendars WHERE id == ${id} AND idUser = ${idUser}`);
  const users = query.all();
  return users;
};

module.exports.saveCalendar = (idMessage, idUser, ical) => {
  const insert = database.prepare('INSERT INTO calendars (id, idUser, ical) VALUES (?, ?, ?)');
  insert.run(idMessage, idUser, ical);
};
