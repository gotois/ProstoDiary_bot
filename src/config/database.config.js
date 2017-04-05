//TODO: Добавить сюда значение из database.client.js

/**
 *
 * @type {{host: String, database: String, user: String, port: String, password: String}}
 */
module.exports = {
  host: process.env.HOST,
  database: process.env.DATABASE,
  user: process.env.USER,
  port: process.env.DBPORT,
  password: process.env.PASSWORD
};
