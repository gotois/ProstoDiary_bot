//TODO: Добавить сюда значение из database.client.js
const {HOST, DATABASE, USER, DBPORT, PASSWORD} = process.env;
/**
 *
 * @type {{host: String, database: String, user: String, port: String, password: String}}
 */
module.exports = {
  host: HOST,
  database: DATABASE,
  user: USER,
  port: DBPORT,
  password: PASSWORD,
};
