const sqlite = require('node:sqlite');

const database = new sqlite.DatabaseSync(':memory:');

database.exec(`
  CREATE TABLE users(
    key INTEGER PRIMARY KEY,
    value TEXT
  ) STRICT
`);

module.exports = database;
