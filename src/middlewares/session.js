const session = require('express-session');

module.exports = session({
  secret: 'some-secret-msg',
  saveUninitialized: true,
  resave: false,
});
