/**
 *
 * @type {{host: *, database: *, user: *, port: *, password: *}}
 */
module.exports = {
  host: process.env.HOST,
  database: process.env.DATABASE,
  user: process.env.USER,
  port: process.env.DBPORT,
  password: process.env.PASSWORD
};
