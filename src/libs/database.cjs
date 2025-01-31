const sqlite = require('node:sqlite');
const tzlookup = require('@photostructure/tz-lookup');
const { IS_DEV } = require('../environments/index.cjs');

const database = (() => {
  const location = IS_DEV ? 'database.sqlite' : ':memory:';
  return new sqlite.DatabaseSync(location);
})();

function createUsersTable() {
  database.exec(`
      CREATE TABLE if not exists users(
        id INTEGER PRIMARY KEY,
        location TEXT NULL,
        timezone TEXT DEFAULT 'UTC',
        jwt TEXT
      ) STRICT
    `);
}

function createCalendarsTable() {
  database.exec(`
      CREATE TABLE if not exists calendars(
        id INTEGER PRIMARY KEY,
        message_id INTEGER,
        title TEXT,
        details TEXT NULL,
        location TEXT NULL,
        start TEXT,
        end TEXT
      ) STRICT
    `);
}

try {
  createUsersTable();
} catch {
  // ...
}
try {
  createCalendarsTable();
} catch (error) {
  console.warn(error);
}

module.exports = database;

module.exports.hasUser = (idUser) => {
  const query = database.prepare(`SELECT * FROM users WHERE id == ${idUser}`);
  const users = query.all();

  return users.length > 0;
};

module.exports.getUsers = (idUser) => {
  const query = database.prepare(`SELECT * FROM users WHERE id == ${idUser}`);

  return query.all();
};

module.exports.setNewUser = (userId) => {
  const insert = database.prepare(`
    INSERT INTO users (id) VALUES (:id)
  `);
  insert.run({ id: userId });
};

module.exports.updateUserLocation = (userId, { latitude, longitude, u = 50 }) => {
  const timezone = tzlookup(latitude, longitude);

  // https://www.here.com/docs/bundle/places-search-api-developer-guide/page/topics/location-contexts.html#location-contexts__position-format
  const location = `geo:${latitude},${longitude};cgen=gps;u=${u}`;
  const insert = database.prepare(`
    INSERT INTO users (id, location, timezone) VALUES (:id, :location, :timezone)
    ON CONFLICT(id)
    DO
      UPDATE SET location = :location, timezone = :timezone
      WHERE id = :id
  `);
  insert.run({ id: userId, location, timezone });
};

module.exports.setJWT = (userId, jwt) => {
  const insert = database.prepare(`
    INSERT INTO users (id, jwt) VALUES (:id, :jwt)
    ON CONFLICT(id)
    DO
      UPDATE SET jwt = :jwt
      WHERE id = :id
  `);
  insert.run({ id: userId, jwt: jwt });
};

module.exports.getCalendarMessage = (id) => {
  const query = database.prepare(`SELECT * FROM calendars WHERE message_id == ${id}`);
  const events = query.all();

  return events[0];
};

/**
 * @description сохранение в базу SQLite на временное хранилище
 * @param {object} calendar - объект события
 * @param {number} calendar.id - идентификатор сообщения
 * @param {string} calendar.title - заголовок события
 * @param {string|null} [calendar.details] - детали события
 * @param {string|null} [calendar.location] - местоположение события
 * @param {string} calendar.start - время начала события
 * @param {string} calendar.end - время окончания события
 */
module.exports.saveCalendar = ({ id, title, details = null, location = null, start, end }) => {
  const insert = database.prepare(`
    INSERT INTO calendars (message_id, title, details, location, start, end)
    VALUES (:message_id, :title, :details, :location, :start, :end)`);
  insert.run({
    message_id: id,
    title: title,
    details: details,
    location: location,
    start: start,
    end: end,
  });
};
