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
  // fixme - дополнительно делать запрос на создание таблицы если ее нет
  return true ? new sqlite.DatabaseSync('database.sqlite') : new sqlite.DatabaseSync(':memory:');
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

module.exports.getCalendars = (id, idUser) => {
  const query = database.prepare(`SELECT * FROM calendars WHERE id == ${id} AND idUser = ${idUser}`);
  const users = query.all();
  return users;
};

module.exports.setJWT = (userId, jwt) => {
  const insert = database.prepare('INSERT INTO users (key, jwt) VALUES (?, ?)');
  insert.run(userId, jwt);
};

module.exports.saveCalendar = (idMessage, idUser, ical) => {
  const insert = database.prepare('INSERT INTO calendars (id, idUser, ical) VALUES (?, ?, ?)');
  insert.run(idMessage, idUser, ical);
};
