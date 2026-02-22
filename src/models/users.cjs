const { userDB } = require('../libs/database.cjs');

function createUsersTable() {
  userDB.exec(`
      CREATE TABLE if not exists users(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        location TEXT NULL,
        language TEXT DEFAULT 'ru-RU',
        timezone TEXT NULL,
        jwt TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      ) STRICT
    `);
}

try {
  createUsersTable();
} catch (error) {
  console.warn(error);
}

/**
 * Удаляет пользователя по id
 * @param {string} userId - идентификатор пользователя
 */
module.exports.deleteUser = (userId) => {
  const query = userDB.prepare('DELETE FROM users WHERE id == ?');
  query.run(userId);
};

module.exports.hasUser = (userId) => {
  const query = userDB.prepare('SELECT * FROM users WHERE id == ?');
  const users = query.all(userId);

  return users.length > 0;
};

module.exports.getUsers = (userId) => {
  const query = userDB.prepare('SELECT * FROM users WHERE id == ?');

  return query.all(userId);
};

/**
 * @param {string} userId - telegram user id
 */
module.exports.setNewUser = (userId) => {
  const insert = userDB.prepare(`
    INSERT INTO users (id) VALUES (:id)
  `);
  insert.run({ id: userId });
};

/**
 * @description обновление местоположения пользователя
 * @see https://www.here.com/docs/bundle/places-search-api-developer-guide/page/topics/location-contexts.html#location-contexts__position-format
 * @param {string} userId - user id
 * @param {object} obj - object
 * @param {string} obj.timezone - timezone
 * @param {number} obj.latitude - latitude
 * @param {number} obj.longitude - longitude
 * @param {number} [obj.u] - u
 */
module.exports.updateUserLocation = (userId, { latitude, longitude, u = 50 }) => {
  const location = `geo:${latitude},${longitude};cgen=gps;u=${u}`;
  const insert = userDB.prepare(`
    INSERT INTO users (id, location) VALUES (:id, :location)
    ON CONFLICT(id)
    DO
      UPDATE SET location = :location
      WHERE id = :id
  `);
  insert.run({ id: userId, location });
};

module.exports.updateUserTimezone = (userId, timezone) => {
  const insert = userDB.prepare(`
    INSERT INTO users (id, timezone) VALUES (:id, :timezone)
    ON CONFLICT(id)
    DO
      UPDATE SET timezone = :timezone
      WHERE id = :id
  `);
  insert.run({ id: userId, timezone });
};

module.exports.setJWT = (userId, jwt) => {
  const insert = userDB.prepare(`
    INSERT INTO users (id, jwt) VALUES (:id, :jwt)
    ON CONFLICT(id)
    DO
      UPDATE SET jwt = :jwt
      WHERE id = :id
  `);
  insert.run({ id: userId, jwt: jwt });
};
/**
 * @description обновление языка пользователя
 * @param {string} userId - user id
 * @param {string} language - language code
 */
module.exports.setLanguage = (userId, language) => {
  const insert = userDB.prepare(`
    INSERT INTO users (id, language) VALUES (:id, :language)
    ON CONFLICT(id)
    DO
      UPDATE SET language = :language
      WHERE id = :id
  `);
  insert.run({ id: userId, language });
};
