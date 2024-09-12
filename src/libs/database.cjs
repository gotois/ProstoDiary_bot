const sqlite = require('node:sqlite');

const database = new sqlite.DatabaseSync(':memory:');

database.exec(`
  CREATE TABLE users(
    key INTEGER PRIMARY KEY,
    jwt TEXT
  ) STRICT
`);

module.exports = database;

module.exports.getUsers = (userId) => {
  const query = database.prepare(`SELECT * FROM users WHERE key == ${userId}`);
  const users = query.all();
  return users;
};

module.exports.setJWT = (userId, jwt) => {
  const insert = database.prepare('INSERT INTO users (key, jwt) VALUES (?, ?)');
  insert.run(userId, jwt);
};
