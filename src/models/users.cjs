const { userDB } = require('../libs/database.cjs');

module.exports.hasUser = (idUser) => {
  const query = userDB.prepare(`SELECT * FROM users WHERE id == ${idUser}`);
  const users = query.all();

  return users.length > 0;
};

module.exports.getUsers = (idUser) => {
  const query = userDB.prepare(`SELECT * FROM users WHERE id == ${idUser}`);

  return query.all();
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
module.exports.updateUserLocation = (userId, { timezone, latitude, longitude, u = 50 }) => {
  const location = `geo:${latitude},${longitude};cgen=gps;u=${u}`;
  const insert = userDB.prepare(`
    INSERT INTO users (id, location, timezone) VALUES (:id, :location, :timezone)
    ON CONFLICT(id)
    DO
      UPDATE SET location = :location, timezone = :timezone
      WHERE id = :id
  `);
  insert.run({ id: userId, location, timezone });
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
