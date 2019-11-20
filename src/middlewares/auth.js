const auth = require('http-auth');

// todo: сделать кастомный вход - https://www.npmjs.com/package/http-auth#custom-authentication
const digest = auth.digest({
  realm: 'demo', // demo:demo
  file: __dirname + '/../../.htdigest',
});

module.exports = auth.connect(digest);
