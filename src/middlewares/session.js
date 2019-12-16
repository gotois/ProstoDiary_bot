const session = require('express-session');

module.exports = session({
  store: new (require('connect-pg-simple')(session))(),
  secret: 'some-secret-msg', // todo использовать секрет вшитый в энвайрмент
  saveUninitialized: false,
  resave: false,
  cookie: { maxAge: 1 * 24 * 60 * 60 * 1000 }, // 1 day
});
