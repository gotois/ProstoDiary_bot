const jayson = require('jayson/promise');

// Приватный API, который доступен только основному серверу
module.exports = jayson.server({
  'ping': require('./v1/ping'),

  // bot activation
  'bot-sign-in': require('./v1/bot-sign-in'),
  'bot-sign-out': require('./v1/bot-sign-out'),

  // get messages
  'get-date-message': require('./v1/get-date-message'),
  'get-latest-message': require('./v1/get-latest-message'),
  'get-raw-message': require('./v1/get-raw-message'),
  'get-revision-message': require('./v1/get-revision-message'),
});
