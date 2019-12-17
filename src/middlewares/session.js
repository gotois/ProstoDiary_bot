const session = require('express-session');
const pgSimple = require('connect-pg-simple');

module.exports = session({
  store: new (pgSimple(session))(),
  secret: 'some-secret-msg', // todo использовать секрет вшитый в энвайрмент
  saveUninitialized: false,
  resave: false,
  cookie: { maxAge: 1 * 24 * 60 * 60 * 1000 }, // 1 day
});
