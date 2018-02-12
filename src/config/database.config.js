//TODO: Добавить сюда значение из database.client.js
const {HOST, DATABASE, DB_USER, DBPORT, PASSWORD} = process.env;
/**
 *
 * @type {{host: String, database: String, user: String, port: String, password: String}}
 */
module.exports = {
  host: HOST,
  database: DATABASE,
  user: DB_USER,
  port: DBPORT,
  password: PASSWORD,
};
