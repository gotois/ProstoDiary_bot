const jayson = require('jayson/promise');

// Приватный API, который доступен только основному серверу
module.exports = jayson.server({
  'ping': require('./ping'),

  // bot activation
  'bot-sign-in': require('./bot-sign-in'),
  'bot-sign-out': require('./bot-sign-out'),

  // get messages
  'get-date-message': require('./get-date-message'),
  'get-latest-message': require('./get-latest-message'),
  'get-raw-message': require('./get-raw-message'),
  'get-revision-message': require('./get-revision-message'),
});
