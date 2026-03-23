const { jwtDecode } = require('jwt-decode');
const { userDB } = require('../libs/database.cjs');

try {
  userDB.exec(`
    CREATE TABLE if not exists users(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      actor_id TEXT,
      location TEXT NULL,
      language TEXT DEFAULT 'en',
      timezone TEXT NULL,
      access_token TEXT,
      id_token TEXT,
      refresh_token TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      expired_at INTEGER NULL
    ) STRICT
  `);
} catch (error) {
  console.error(error);
}

/**
 * Удаляет пользователя по id
 * @param {number} userId - идентификатор пользователя
 * @returns {undefined}
 */
module.exports.deleteUser = (userId) => {
  const query = userDB.prepare('DELETE FROM users WHERE id == ?');
  query.run(userId);
};

/**
 * @param {number} userId - telegram user id
 * @returns {boolean}
 */
module.exports.hasUser = (userId) => {
  const query = userDB.prepare('SELECT * FROM users WHERE id == ?');
  const users = query.all(userId);

  return users.length > 0;
};
/**
 * @param {number} userId - telegram user id
 * @returns {Record<string, any>} - user
 */
module.exports.getUser = (userId) => {
  const query = userDB.prepare('SELECT * FROM users WHERE id == ?');

  return query.get(userId);
};

/**
 * @param {string} actorId - secretary actor id
 * @returns {Record<string, any>|undefined} - user or undefined if not found
 */
module.exports.getUserByActorId = (actorId) => {
  const query = userDB.prepare('SELECT * FROM users WHERE actor_id == ?');
  return query.get(actorId);
};

/**
 * @param {number} userId - telegram user id
 * @returns {Record<string, any>} - user
 */
module.exports.setNewUser = (userId) => {
  const insert = userDB.prepare(`
    INSERT INTO users (id) VALUES (:id)
  `);
  insert.run({ id: userId });

  return module.exports.getUser(userId);
};

/**
 * @description обновление местоположения пользователя
 * @see https://www.here.com/docs/bundle/places-search-api-developer-guide/page/topics/location-contexts.html#location-contexts__position-format
 * @param {number} userId - telegram user id
 * @param {object} obj - object
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
/**
 * @param {number|string} userId - telegram user id
 * @param {string} timezone - timezone
 */
module.exports.updateUserTimezone = (userId, timezone) => {
  const insert = userDB.prepare(`
    INSERT INTO users (id, timezone) VALUES (:id, :timezone)
    ON CONFLICT(id)
    DO
      UPDATE SET timezone = :timezone
      WHERE id = :id
  `);
  insert.run({ id: Number(userId), timezone });
};
/**
 * @description обновление JWT токенов пользователя
 * @param {string} userId - telegram user id
 * @param {string} actorId - secretary actor id
 * @param {{access_token:string,expires_in:number,id_token:string,refresh_token:string,token_type:string}} tokens - json web tokens
 */
module.exports.setJWT = (userId, actorId, tokens) => {
  const { access_token, id_token, refresh_token } = tokens;
  const { exp } = jwtDecode(id_token);

  const insert = userDB.prepare(`
    INSERT INTO users (id, actor_id, access_token, id_token, refresh_token, expired_at) VALUES (:id, :actor_id, :access_token, :id_token, :refresh_token, :exp)
    ON CONFLICT(id)
    DO
      UPDATE SET
        actor_id = :actor_id,
        access_token = :access_token,
        id_token = :id_token,
        refresh_token = :refresh_token,
        expired_at = :exp
      WHERE id = :id
  `);
  insert.run({ id: userId, actor_id: actorId, access_token, id_token, refresh_token, exp });
};
/**
 * @description обновление языка пользователя
 * @param {number} userId - user id
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
